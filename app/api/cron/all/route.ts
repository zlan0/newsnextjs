import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';
import { fetchAndSaveRss } from '@/lib/rss';
import { scrapeAndSave } from '@/lib/scraper';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  // Verify this is from Vercel Cron or has the secret token
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  // Allow if: Vercel cron header present, or secret matches, or no secret set (open)
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';
  const hasValidSecret = cronSecret && authHeader === `Bearer ${cronSecret}`;
  const isOpen = !cronSecret;
  
  if (!isVercelCron && !hasValidSecret && !isOpen) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initDb();
    
    const [rssResult, scrapeResult] = await Promise.allSettled([
      fetchAndSaveRss(),
      scrapeAndSave(),
    ]);

    return NextResponse.json({
      success: true,
      rss: rssResult.status === 'fulfilled' ? rssResult.value : { error: String(rssResult.reason) },
      scrape: scrapeResult.status === 'fulfilled' ? scrapeResult.value : { error: String(scrapeResult.reason) },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
