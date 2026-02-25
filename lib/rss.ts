import Parser from 'rss-parser';
import { getDb } from './db';
import { generateSlug, generateExcerpt } from './utils';
import { rewriteWithAI } from './scraper';

const parser = new Parser({
  customFields: {
    item: [['media:content', 'mediaContent'], ['media:thumbnail', 'mediaThumbnail'], ['enclosure', 'enclosure']],
  },
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; GhanaFrontBot/1.0)',
  },
});

export async function fetchAndSaveRss(): Promise<{ added: number; failed: number }> {
  const db = getDb();
  let added = 0, failed = 0;

  const sources = await db.execute('SELECT * FROM rss_sources WHERE active = 1');

  for (const source of sources.rows as any[]) {
    try {
      const feed = await parser.parseURL(source.url);

      for (const item of (feed.items || []).slice(0, 15)) {
        const title = item.title?.trim();
        const link = item.link?.trim();
        if (!title || !link) continue;

        // Check if already exists
        const existing = await db.execute({ sql: 'SELECT id FROM articles WHERE source_url = ?', args: [link] });
        if (existing.rows.length > 0) continue;

        // Get content from RSS feed
        let content = (item as any).contentEncoded || item.content || item.summary || '';
        
        // Strip HTML tags
        content = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        
        // If content is too short, try to scrape the full article
        if (content.split(/\s+/).length < 150) {
          try {
            const { scrapeArticlePage } = await import('./scraper');
            const scraped = await scrapeArticlePage(link, source.name);
            if (scraped && scraped.content.length > content.length) {
              content = scraped.content;
            }
          } catch (e) {
            // Use RSS content as fallback
          }
        }

        if (content.length < 50) { failed++; continue; }

        // Get image
        const image_url = (item as any).mediaContent?.['$']?.url ||
                         (item as any).mediaThumbnail?.['$']?.url ||
                         (item as any).enclosure?.url ||
                         extractImageFromContent(item.content || '') || null;

        // Detect category
        const category = detectCategory(title + ' ' + source.category);

        // AI rewrite for longer, unique content
        const articleData = { title, content, excerpt: generateExcerpt(content), image_url, source_url: link, source: source.name, category };
        const finalContent = await rewriteWithAI(articleData);

        const slug = await generateUniqueSlug(title);
        const pubDate = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();

        await db.execute({
          sql: `INSERT INTO articles (title, slug, content, excerpt, category, source, source_url, image_url, status, is_scraped, is_ai_rewritten, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', 1, ?, ?, ?)`,
          args: [title, slug, finalContent, generateExcerpt(finalContent), category,
           source.name, link, image_url, process.env.OPENROUTER_API_KEY ? 1 : 0,
           pubDate, pubDate],
        });

        added++;
        await new Promise(r => setTimeout(r, 500));
      }

      await db.execute({ sql: 'UPDATE rss_sources SET last_fetched = datetime("now") WHERE id = ?', args: [source.id] });

    } catch (e) {
      console.error(`RSS fetch failed for ${source.name}:`, e);
      failed++;
    }
  }

  return { added, failed };
}

function extractImageFromContent(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] || null;
}

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  if (/(football|soccer|sport|league|match|goal|player|kotoko|hearts)/i.test(lower)) return 'sports';
  if (/(business|economy|finance|gdp|investment|bank|market|trade)/i.test(lower)) return 'business';
  if (/(entertainment|music|movie|celebrity|nollywood|kumawood)/i.test(lower)) return 'entertainment';
  if (/(health|hospital|doctor|disease|medical|covid)/i.test(lower)) return 'health';
  if (/(technology|tech|app|software|startup|digital)/i.test(lower)) return 'technology';
  if (/(politics|parliament|president|government|minister|election|npp|ndc)/i.test(lower)) return 'politics';
  return 'general';
}

async function generateUniqueSlug(title: string): Promise<string> {
  const db = getDb();
  let slug = generateSlug(title);
  let counter = 0;
  while (true) {
    const testSlug = counter === 0 ? slug : `${slug}-${counter}`;
    const existing = await db.execute({ sql: 'SELECT id FROM articles WHERE slug = ?', args: [testSlug] });
    if (existing.rows.length === 0) return testSlug;
    counter++;
  }
}
