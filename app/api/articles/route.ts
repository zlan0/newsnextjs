import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await initDb();
    const db = getDb();
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    let query = `SELECT * FROM articles WHERE status='published'`;
    const params: any[] = [];
    
    if (category && category !== 'all') {
      query += ` AND category=?`;
      params.push(category);
    }
    
    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    const articles = await db.execute({ sql: query, args: params });
    
    return NextResponse.json({
      articles: articles.rows,
      count: articles.rows.length,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
