import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { generateSlug, generateExcerpt } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    await initDb();
    const db = getDb();
    const body = await request.json();
    const { title, content, category, source, source_url, image_url, author, status } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    let slug = generateSlug(title);
    let counter = 0;
    while (true) {
      const testSlug = counter === 0 ? slug : `${slug}-${counter}`;
      const existing = await db.execute({ sql: 'SELECT id FROM articles WHERE slug = ?', args: [testSlug] });
      if (existing.rows.length === 0) { slug = testSlug; break; }
      counter++;
    }

    const excerpt = generateExcerpt(content);

    await db.execute({
      sql: `INSERT INTO articles (title, slug, content, excerpt, category, source, source_url, image_url, author, status, is_scraped, is_ai_rewritten)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)`,
      args: [title, slug, content, excerpt, category || 'general', source || null, source_url || null,
             image_url || null, author || 'GhanaFront Staff', status || 'published'],
    });

    return NextResponse.json({ success: true, slug });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
