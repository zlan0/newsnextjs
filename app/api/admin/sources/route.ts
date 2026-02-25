import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await initDb();
    const db = getDb();
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'rss';
    const table = type === 'scrape' ? 'scrape_sources' : 'rss_sources';
    const sources = await db.execute(`SELECT * FROM ${table} ORDER BY name ASC`);
    return NextResponse.json({ sources: sources.rows });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initDb();
    const db = getDb();
    const { name, url, category, type } = await request.json();
    const table = type === 'scrape' ? 'scrape_sources' : 'rss_sources';
    await db.execute({ sql: `INSERT OR IGNORE INTO ${table} (name, url, category) VALUES (?, ?, ?)`, args: [name, url, category || 'general'] });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await initDb();
    const db = getDb();
    const { id, active, type } = await request.json();
    const table = type === 'scrape' ? 'scrape_sources' : 'rss_sources';
    await db.execute({ sql: `UPDATE ${table} SET active = ? WHERE id = ?`, args: [active, id] });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
