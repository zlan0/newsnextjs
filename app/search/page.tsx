import { getDb, initDb } from '@/lib/db';
import ArticleCard from '@/components/news/ArticleCard';
import type { Article } from '@/lib/db';

export const revalidate = 0;

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q?.trim() || '';

  let articles: Article[] = [];
  
  if (query.length > 1) {
    try {
      await initDb();
      const db = getDb();
      const results = await db.execute({
        sql: `SELECT * FROM articles WHERE status='published' AND (
          title LIKE ? OR content LIKE ? OR excerpt LIKE ? OR source LIKE ?
        ) ORDER BY created_at DESC LIMIT 30`,
        args: [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
      });
      articles = results.rows as unknown as Article[];
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-20 sm:pb-8">
      {/* Search form */}
      <form method="GET" action="/search" className="mb-6">
        <div className="flex gap-2 max-w-2xl">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search Ghana news..."
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:border-red-500"
            autoFocus
          />
          <button
            type="submit"
            className="px-6 py-3 bg-red-700 text-white rounded-lg font-bold hover:bg-red-800 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {query && (
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
            {articles.length > 0 ? `${articles.length} results for "${query}"` : `No results for "${query}"`}
          </h1>
        </div>
      )}

      {articles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {query && articles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-gray-600">No articles found. Try different keywords.</p>
        </div>
      )}
    </div>
  );
}
