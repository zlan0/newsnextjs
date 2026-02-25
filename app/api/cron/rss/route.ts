import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';
import { fetchAndSaveRss } from '@/lib/rss';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  // Allow: Vercel cron, valid CRON_SECRET, or open (no secret configured)
  const cronSecret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization');
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';
  if (cronSecret && !isVercelCron && auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initDb();
    const result = await fetchAndSaveRss();
    return NextResponse.json({ success: true, ...result, timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
