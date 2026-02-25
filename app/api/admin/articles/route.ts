import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await initDb();
    const db = getDb();
    const url = new URL(request.url);
    const scraped = url.searchParams.get('scraped');
    const stats = url.searchParams.get('stats');

    if (stats) {
      const [total, published, scraped_count, ai] = await Promise.all([
        db.execute('SELECT COUNT(*) as c FROM articles'),
        db.execute("SELECT COUNT(*) as c FROM articles WHERE status='published'"),
        db.execute('SELECT COUNT(*) as c FROM articles WHERE is_scraped=1'),
        db.execute('SELECT COUNT(*) as c FROM articles WHERE is_ai_rewritten=1'),
      ]);
      return NextResponse.json({
        total: (total.rows[0] as any).c,
        published: (published.rows[0] as any).c,
        scraped: (scraped_count.rows[0] as any).c,
        ai_rewritten: (ai.rows[0] as any).c,
      });
    }

    const whereClause = scraped === 'true' ? 'WHERE is_scraped = 1' : '';
    const articles = await db.execute(
      `SELECT id, title, slug, category, source, status, is_scraped, is_ai_rewritten, views, created_at FROM articles ${whereClause} ORDER BY created_at DESC LIMIT 200`
    );

    return NextResponse.json({ articles: articles.rows });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await initDb();
    const db = getDb();
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await db.execute({ sql: 'DELETE FROM articles WHERE id = ?', args: [id] });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await initDb();
    const db = getDb();
    const { id, status } = await request.json();

    await db.execute({ sql: 'UPDATE articles SET status = ?, updated_at = datetime("now") WHERE id = ?', args: [status, id] });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
