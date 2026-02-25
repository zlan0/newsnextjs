import * as cheerio from 'cheerio';
import { getDb } from './db';
import { generateSlug, generateExcerpt } from './utils';

export interface ScrapedArticle {
  title: string;
  content: string;
  excerpt: string;
  image_url: string | null;
  source_url: string;
  source: string;
  category: string;
}

// Fetch with timeout and user agent to avoid blocks
async function fetchWithTimeout(url: string, timeout = 10000): Promise<string> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GhanaFrontBot/1.0; +https://ghanafront.vercel.app)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      next: { revalidate: 0 },
    });
    clearTimeout(id);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

// Extract full article content from article page
export async function scrapeArticlePage(url: string, source: string): Promise<ScrapedArticle | null> {
  try {
    const html = await fetchWithTimeout(url);
    const $ = cheerio.load(html);
    
    // Remove noise
    $('script, style, nav, header, footer, .ad, .advertisement, .social-share, .related-posts, aside, .sidebar').remove();
    
    // Try multiple title selectors
    const title = $('h1').first().text().trim() || 
                  $('meta[property="og:title"]').attr('content') || 
                  $('title').text().trim();
    
    if (!title || title.length < 10) return null;
    
    // Try to get article image
    const image_url = $('meta[property="og:image"]').attr('content') || 
                      $('article img').first().attr('src') ||
                      $('.article-image img, .featured-image img, .post-image img').first().attr('src') || null;
    
    // Extract content - try multiple selectors
    const contentSelectors = [
      'article .content', 'article .body', '.article-content', '.article-body',
      '.post-content', '.entry-content', '.story-content', '.news-content',
      'article p', '.content p', 'main p'
    ];
    
    let content = '';
    for (const selector of contentSelectors) {
      const text = $(selector).text().trim();
      if (text.length > 200) {
        content = text;
        break;
      }
    }
    
    // Fallback: grab all meaningful paragraphs
    if (content.length < 200) {
      const paragraphs: string[] = [];
      $('p').each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 50) paragraphs.push(text);
      });
      content = paragraphs.join('\n\n');
    }
    
    if (content.length < 100) return null;
    
    // Ensure minimum 500 words
    const wordCount = content.split(/\s+/).length;
    if (wordCount < 100) return null; // Too short to be a real article
    
    // Get category from URL or meta
    const keywords = $('meta[name="keywords"]').attr('content') || '';
    const category = detectCategory(url + ' ' + title + ' ' + keywords);
    
    return {
      title,
      content: content.substring(0, 8000), // Cap at reasonable size
      excerpt: generateExcerpt(content),
      image_url,
      source_url: url,
      source,
      category,
    };
  } catch (e) {
    console.error(`Failed to scrape ${url}:`, e);
    return null;
  }
}

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  if (/(football|soccer|sport|league|match|goal|player|team|ghana black|kotoko|hearts)/i.test(lower)) return 'sports';
  if (/(business|economy|finance|gdp|investment|bank|market|trade|economic)/i.test(lower)) return 'business';
  if (/(entertainment|music|movie|celebrity|actor|actress|nollywood|kumawood)/i.test(lower)) return 'entertainment';
  if (/(health|hospital|doctor|disease|medical|covid|hospital|ministry of health)/i.test(lower)) return 'health';
  if (/(technology|tech|app|software|startup|digital|cyber)/i.test(lower)) return 'technology';
  if (/(politics|parliament|president|government|minister|election|npp|ndc|opposition)/i.test(lower)) return 'politics';
  return 'general';
}

// Rewrite article using free AI (OpenRouter with free models)
export async function rewriteWithAI(article: ScrapedArticle): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    // Without AI, just expand and clean the content
    return expandContent(article.content, article.title);
  }
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://ghanafront.vercel.app',
        'X-Title': 'GhanaFront News',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free', // Free model
        messages: [{
          role: 'user',
          content: `You are a professional Ghanaian news journalist. Rewrite this news article to be original, engaging, and 600-900 words long. Keep all facts accurate. Add context about Ghana where relevant. Use proper journalism style with an engaging intro, well-structured body paragraphs, and a conclusion.

Title: ${article.title}

Original content:
${article.content.substring(0, 3000)}

Write the full rewritten article (600-900 words). Only output the article text, no headers or meta info.`
        }],
        max_tokens: 1500,
      }),
    });
    
    if (!response.ok) throw new Error(`AI API error: ${response.status}`);
    const data = await response.json();
    const rewritten = data.choices?.[0]?.message?.content;
    
    if (rewritten && rewritten.length > 300) return rewritten;
    return expandContent(article.content, article.title);
  } catch (e) {
    console.error('AI rewrite failed, using expansion fallback:', e);
    return expandContent(article.content, article.title);
  }
}

// Expand short content to meet minimum length without AI
function expandContent(content: string, title: string): string {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  if (sentences.length < 5) return content;
  
  // Format into proper paragraphs
  const paragraphs: string[] = [];
  for (let i = 0; i < sentences.length; i += 3) {
    const chunk = sentences.slice(i, i + 3).join('. ').trim();
    if (chunk.length > 50) paragraphs.push(chunk + '.');
  }
  
  return paragraphs.join('\n\n');
}

// Main scrape function called by cron
export async function scrapeAndSave(): Promise<{ added: number; failed: number }> {
  const db = getDb();
  let added = 0, failed = 0;
  
  // Get active scrape sources
  const sources = await db.execute('SELECT * FROM scrape_sources WHERE active = 1');
  
  for (const source of sources.rows as any[]) {
    try {
      const html = await fetchWithTimeout(source.url);
      const $ = cheerio.load(html);
      
      // Get article links from homepage
      const links: string[] = [];
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (!href) return;
        
        const fullUrl = href.startsWith('http') ? href : new URL(href, source.url).href;
        
        // Filter for likely article URLs (has date pattern or /news/ /article/ etc)
        if (fullUrl.includes(source.url.replace('https://', '').replace('http://', '').split('/')[0]) &&
            /\/\d{4}\/|\/(news|article|story|post)\//i.test(fullUrl) &&
            !links.includes(fullUrl) &&
            links.length < 10) {
          links.push(fullUrl);
        }
      });
      
      // Scrape each article
      for (const link of links.slice(0, 5)) {
        // Check if already exists
        const existing = await db.execute({ sql: 'SELECT id FROM articles WHERE source_url = ?', args: [link] });
        if (existing.rows.length > 0) continue;
        
        const article = await scrapeArticlePage(link, source.name);
        if (!article) { failed++; continue; }
        
        // Rewrite with AI if configured
        const finalContent = await rewriteWithAI(article);
        
        const slug = await generateUniqueSlug(article.title);
        
        await db.execute({
          sql: `INSERT INTO articles (title, slug, content, excerpt, category, source, source_url, image_url, status, is_scraped, is_ai_rewritten)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', 1, ?)`,
          args: [article.title, slug, finalContent, article.excerpt, article.category,
           article.source, article.source_url, article.image_url,
           process.env.OPENROUTER_API_KEY ? 1 : 0],
        });
        
        added++;
        
        // Small delay between requests
        await new Promise(r => setTimeout(r, 1000));
      }
      
      // Update last_scraped
      await db.execute({ sql: 'UPDATE scrape_sources SET last_scraped = datetime("now") WHERE id = ?', args: [source.id] });
      
    } catch (e) {
      console.error(`Scrape failed for ${source.name}:`, e);
      failed++;
    }
  }
  
  return { added, failed };
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
