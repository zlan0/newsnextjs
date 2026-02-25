import { getDb, initDb } from '@/lib/db';
import ArticleCard from '@/components/news/ArticleCard';
import type { Article } from '@/lib/db';
import Link from 'next/link';

export const revalidate = 300; // Revalidate every 5 minutes

async function getArticles() {
  try {
    await initDb();
    const db = getDb();
    
    const [featured, latest, politics, sports, business, entertainment] = await Promise.all([
      db.execute(`SELECT * FROM articles WHERE status='published' ORDER BY created_at DESC LIMIT 5`),
      db.execute(`SELECT * FROM articles WHERE status='published' ORDER BY created_at DESC LIMIT 20`),
      db.execute(`SELECT * FROM articles WHERE status='published' AND category='politics' ORDER BY created_at DESC LIMIT 4`),
      db.execute(`SELECT * FROM articles WHERE status='published' AND category='sports' ORDER BY created_at DESC LIMIT 4`),
      db.execute(`SELECT * FROM articles WHERE status='published' AND category='business' ORDER BY created_at DESC LIMIT 4`),
      db.execute(`SELECT * FROM articles WHERE status='published' AND category='entertainment' ORDER BY created_at DESC LIMIT 4`),
    ]);
    
    return {
      featured: featured.rows as unknown as Article[],
      latest: latest.rows as unknown as Article[],
      politics: politics.rows as unknown as Article[],
      sports: sports.rows as unknown as Article[],
      business: business.rows as unknown as Article[],
      entertainment: entertainment.rows as unknown as Article[],
    };
  } catch (e) {
    // Only log in runtime, not during build-time static generation
    if (process.env.NODE_ENV === 'production' && process.env.TURSO_DATABASE_URL) console.error('Failed to fetch articles:', e);
    return { featured: [], latest: [], politics: [], sports: [], business: [], entertainment: [] };
  }
}

export default async function HomePage() {
  const { featured, latest, politics, sports, business, entertainment } = await getArticles();
  
  const hasArticles = latest.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-20 sm:pb-6">
      
      {/* Featured Section */}
      {hasArticles ? (
        <section className="mb-6 sm:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Main feature */}
            {featured[0] && (
              <div className="md:col-span-1 lg:col-span-2">
                <ArticleCard article={featured[0]} variant="featured" />
              </div>
            )}
            {/* Secondary features */}
            <div className="flex flex-col gap-3">
              {featured.slice(1, 3).map(article => (
                <ArticleCard key={article.id} article={article} variant="featured" />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <EmptyState />
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Main column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Latest news */}
          {latest.length > 5 && (
            <section>
              <SectionHeader title="Latest News" href="/" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {latest.slice(5, 11).map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          )}

          {/* Politics */}
          {politics.length > 0 && (
            <section>
              <SectionHeader title="Politics" href="/category/politics" color="red" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {politics.map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          )}

          {/* Sports */}
          {sports.length > 0 && (
            <section>
              <SectionHeader title="Sports" href="/category/sports" color="blue" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sports.map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right sidebar */}
        <aside className="space-y-6">
          
          {/* Business */}
          {business.length > 0 && (
            <section>
              <SectionHeader title="Business" href="/category/business" color="green" />
              <div className="space-y-0">
                {business.map(article => (
                  <ArticleCard key={article.id} article={article} variant="compact" />
                ))}
              </div>
            </section>
          )}

          {/* Entertainment */}
          {entertainment.length > 0 && (
            <section>
              <SectionHeader title="Entertainment" href="/category/entertainment" color="purple" />
              <div className="space-y-0">
                {entertainment.map(article => (
                  <ArticleCard key={article.id} article={article} variant="compact" />
                ))}
              </div>
            </section>
          )}

          {/* Ad placeholder */}
          <div className="bg-gray-100 rounded-lg p-4 text-center text-sm text-gray-400 border-2 border-dashed border-gray-200">
            <p className="font-semibold mb-1">Advertisement</p>
            <p className="text-xs">Google AdSense slot here</p>
            <p className="text-xs mt-1 font-mono">300×250</p>
          </div>
        </aside>
      </div>

      {/* More stories */}
      {latest.length > 11 && (
        <section className="mt-8">
          <SectionHeader title="More Stories" href="/" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {latest.slice(11, 20).map(article => (
              <ArticleCard key={article.id} article={article} variant="horizontal" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHeader({ title, href, color = 'red' }: { title: string; href: string; color?: string }) {
  const borderColor = color === 'red' ? 'border-red-700' : color === 'green' ? 'border-green-700' : color === 'blue' ? 'border-blue-700' : color === 'purple' ? 'border-purple-700' : 'border-red-700';
  const textColor = color === 'red' ? 'text-red-700' : color === 'green' ? 'text-green-700' : color === 'blue' ? 'text-blue-700' : color === 'purple' ? 'text-purple-700' : 'text-red-700';

  return (
    <div className={`flex items-center justify-between border-b-2 ${borderColor} pb-2 mb-3`}>
      <h2 className={`text-base sm:text-lg font-black uppercase tracking-wide ${textColor}`} style={{ fontFamily: 'Playfair Display, serif' }}>
        {title}
      </h2>
      <Link href={href} className={`text-xs font-semibold ${textColor} hover:underline`}>
        See all →
      </Link>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-xl p-8 sm:p-12 text-center border border-gray-100 shadow-sm mb-8">
      <div className="text-5xl mb-4">📰</div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">No articles yet</h2>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        Articles will appear here once the automatic scraper runs. Visit the admin panel to trigger a manual scrape or add articles.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/admin" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-700 text-white rounded-lg font-semibold hover:bg-red-800 transition-colors">
          Go to Admin Panel
        </Link>
        <a href="/api/cron/rss" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors">
          Trigger RSS Fetch
        </a>
      </div>
    </div>
  );
}
