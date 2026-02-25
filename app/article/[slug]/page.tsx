import { getDb, initDb } from '@/lib/db';
import { formatDate, contentToHtml, CATEGORIES } from '@/lib/utils';
import type { Article } from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ArticleCard from '@/components/news/ArticleCard';
import type { Metadata } from 'next';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    await initDb();
    const db = getDb();
    const result = await db.execute({
      sql: 'SELECT title, excerpt, image_url FROM articles WHERE slug = ? AND status = ?',
      args: [slug, 'published'],
    });
    const article = result.rows[0] as any;
    if (!article) return {};
    return {
      title: article.title,
      description: article.excerpt || '',
      openGraph: {
        title: article.title,
        description: article.excerpt || '',
        images: article.image_url ? [article.image_url] : [],
      },
    };
  } catch { return {}; }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    await initDb();
    const db = getDb();

    const result = await db.execute({
      sql: 'SELECT * FROM articles WHERE slug = ? AND status = ?',
      args: [slug, 'published'],
    });

    const article = result.rows[0] as unknown as Article;
    if (!article) notFound();

    db.execute({ sql: 'UPDATE articles SET views = views + 1 WHERE slug = ?', args: [slug] }).catch(() => {});

    const related = await db.execute({
      sql: "SELECT * FROM articles WHERE status='published' AND category=? AND slug != ? ORDER BY created_at DESC LIMIT 4",
      args: [article.category, slug],
    });

    const catLabel = CATEGORIES.find(c => c.slug === article.category)?.label || 'General';
    const htmlContent = contentToHtml(article.content);

    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-20 sm:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <article className="lg:col-span-2">
            <nav className="flex items-center gap-2 text-xs text-gray-500 mb-4">
              <Link href="/" className="hover:text-red-700">Home</Link>
              <span>›</span>
              <Link href={`/category/${article.category}`} className="hover:text-red-700">{catLabel}</Link>
              <span>›</span>
              <span className="text-gray-800 truncate max-w-48">{article.title}</span>
            </nav>

            <Link href={`/category/${article.category}`}>
              <span className="inline-block bg-red-700 text-white text-xs font-bold px-3 py-1 uppercase tracking-wider mb-3 hover:bg-red-800 transition-colors">
                {catLabel}
              </span>
            </Link>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 leading-tight mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 pb-4 border-b border-gray-200 mb-6">
              <span className="font-semibold text-gray-700">{article.author}</span>
              {article.source && <><span>•</span><span>{article.source}</span></>}
              <span>•</span>
              <time dateTime={article.created_at}>{formatDate(article.created_at)}</time>
              {article.is_ai_rewritten === 1 && (
                <><span>•</span><span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded">AI Enhanced</span></>
              )}
            </div>

            {article.image_url && (
              <div className="relative w-full h-56 sm:h-72 lg:h-80 mb-6 rounded-lg overflow-hidden bg-gray-100">
                <Image src={article.image_url} alt={article.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 66vw" priority />
              </div>
            )}

            {article.excerpt && (
              <p className="text-lg text-gray-600 font-medium leading-relaxed mb-6 italic border-l-4 border-red-700 pl-4">
                {article.excerpt}
              </p>
            )}

            <div className="article-content" dangerouslySetInnerHTML={{ __html: htmlContent }} />

            {article.source_url && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">
                  Original source:{' '}
                  <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="text-red-700 hover:underline font-medium">
                    {article.source || article.source_url}
                  </a>
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
              <span className="text-sm font-semibold text-gray-700">Share:</span>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-black text-white text-xs font-semibold rounded-full hover:bg-gray-800 transition-colors">𝕏 Share</a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(process.env.NEXT_PUBLIC_SITE_URL || '')}/article/${article.slug}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-full hover:bg-blue-700 transition-colors">Facebook</a>
              <a href={`https://wa.me/?text=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded-full hover:bg-green-700 transition-colors">WhatsApp</a>
            </div>
          </article>

          <aside className="space-y-6">
            {related.rows.length > 0 && (
              <section>
                <h2 className="text-base font-black uppercase tracking-wide text-red-700 border-b-2 border-red-700 pb-2 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Related Stories
                </h2>
                <div className="space-y-0">
                  {(related.rows as unknown as Article[]).map(a => (
                    <ArticleCard key={a.id} article={a} variant="compact" />
                  ))}
                </div>
              </section>
            )}
            <div className="bg-gray-100 rounded-lg p-4 text-center text-sm text-gray-400 border-2 border-dashed border-gray-200">
              <p className="font-semibold mb-1">Advertisement</p>
              <p className="text-xs">Google AdSense</p>
              <p className="text-xs font-mono">300×600</p>
            </div>
          </aside>
        </div>
      </div>
    );
  } catch (e) {
    notFound();
  }
}
