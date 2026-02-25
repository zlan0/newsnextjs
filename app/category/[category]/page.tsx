import { getDb, initDb } from '@/lib/db';
import ArticleCard from '@/components/news/ArticleCard';
import type { Article } from '@/lib/db';
import { CATEGORIES } from '@/lib/utils';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const cat = CATEGORIES.find(c => c.slug === categorySlug);
  if (!cat) return {};
  return {
    title: `${cat.label} News`,
    description: `Latest ${cat.label} news from Ghana`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { category: categorySlug } = await params;
  const resolvedSearchParams = await searchParams;
  const cat = CATEGORIES.find(c => c.slug === categorySlug);
  if (!cat) notFound();

  const page = parseInt(resolvedSearchParams.page || '1');
  const perPage = 18;
  const offset = (page - 1) * perPage;

  try {
    await initDb();
    const db = getDb();

    const whereClause = categorySlug === 'general'
      ? `WHERE status='published'`
      : `WHERE status='published' AND category='${categorySlug}'`;

    const [articles, countResult] = await Promise.all([
      db.execute(`SELECT * FROM articles ${whereClause} ORDER BY created_at DESC LIMIT ${perPage} OFFSET ${offset}`),
      db.execute(`SELECT COUNT(*) as total FROM articles ${whereClause}`),
    ]);

    const total = (countResult.rows[0] as any).total;
    const totalPages = Math.ceil(total / perPage);
    const items = articles.rows as unknown as Article[];

    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-20 sm:pb-8">
        {/* Header */}
        <div className="mb-6 border-b-4 border-red-700 pb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
            {cat.label} News
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {total} articles • Page {page} of {totalPages}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No articles in this category yet.</p>
            <Link href="/" className="mt-4 inline-block text-red-700 hover:underline">← Back to Home</Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {page > 1 && (
                  <Link href={`/category/${categorySlug}?page=${page - 1}`} className="pagination-btn">‹</Link>
                )}
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <Link key={p} href={`/category/${categorySlug}?page=${p}`} className={`pagination-btn ${p === page ? 'active' : ''}`}>
                      {p}
                    </Link>
                  );
                })}
                {page < totalPages && (
                  <Link href={`/category/${categorySlug}?page=${page + 1}`} className="pagination-btn">›</Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  } catch (e) {
    return <div className="p-8 text-center text-red-600">Error loading articles. Please try again.</div>;
  }
}
