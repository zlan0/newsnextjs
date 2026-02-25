import Link from 'next/link';
import Image from 'next/image';
import { formatDate, CATEGORIES } from '@/lib/utils';
import type { Article } from '@/lib/db';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'featured' | 'compact' | 'horizontal';
}

const categoryColors: Record<string, string> = {
  politics: 'bg-red-600',
  business: 'bg-green-700',
  sports: 'bg-blue-600',
  entertainment: 'bg-purple-600',
  health: 'bg-emerald-600',
  technology: 'bg-cyan-600',
  general: 'bg-gray-600',
};

export default function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const catColor = categoryColors[article.category] || 'bg-gray-600';
  const catLabel = CATEGORIES.find(c => c.slug === article.category)?.label || 'General';

  if (variant === 'featured') {
    return (
      <Link href={`/article/${article.slug}`} className="group block">
        <article className="relative overflow-hidden rounded-lg bg-gray-900 h-80 sm:h-96">
          {article.image_url ? (
            <Image
              src={article.image_url}
              alt={article.title}
              fill
              className="object-cover opacity-60 group-hover:opacity-50 transition-opacity"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-red-900 to-gray-900 opacity-80" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
            <span className={`category-badge text-white ${catColor} mb-2 inline-block`}>{catLabel}</span>
            <h2 className="text-white font-bold text-lg sm:text-2xl line-clamp-3 group-hover:text-yellow-300 transition-colors" style={{ fontFamily: 'Playfair Display, serif' }}>
              {article.title}
            </h2>
            <div className="flex items-center gap-3 mt-2 text-gray-300 text-xs sm:text-sm">
              <span>{article.source || 'GhanaFront'}</span>
              <span>•</span>
              <span>{formatDate(article.created_at)}</span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link href={`/article/${article.slug}`} className="group flex gap-3 py-3 border-b border-gray-100 last:border-0">
        <div className="flex-1 min-w-0">
          <span className={`category-badge text-white ${catColor} text-[9px] mb-1 inline-block`}>{catLabel}</span>
          <h3 className="text-sm font-semibold text-gray-800 group-hover:text-red-700 transition-colors line-clamp-2 leading-tight">
            {article.title}
          </h3>
          <span className="text-xs text-gray-400 mt-0.5 block">{formatDate(article.created_at)}</span>
        </div>
        {article.image_url && (
          <div className="relative w-16 h-14 flex-shrink-0 rounded overflow-hidden">
            <Image src={article.image_url} alt={article.title} fill className="object-cover" sizes="64px" />
          </div>
        )}
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link href={`/article/${article.slug}`} className="group flex gap-4 article-card bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 p-3">
        <div className="relative w-24 h-20 sm:w-32 sm:h-24 flex-shrink-0 rounded overflow-hidden bg-gray-100">
          {article.image_url ? (
            <Image src={article.image_url} alt={article.title} fill className="object-cover" sizes="128px" />
          ) : (
            <div className="w-full h-full img-placeholder">
              <span className="text-2xl">📰</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 py-1">
          <span className={`category-badge text-white ${catColor} text-[9px] mb-1 inline-block`}>{catLabel}</span>
          <h3 className="font-bold text-gray-900 group-hover:text-red-700 transition-colors line-clamp-2 text-sm sm:text-base leading-snug" style={{ fontFamily: 'Playfair Display, serif' }}>
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-xs text-gray-500 line-clamp-2 mt-1 hidden sm:block">{article.excerpt}</p>
          )}
          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
            <span>{article.source || 'GhanaFront'}</span>
            <span>•</span>
            <span>{formatDate(article.created_at)}</span>
          </div>
        </div>
      </Link>
    );
  }

  // Default card
  return (
    <Link href={`/article/${article.slug}`} className="group block article-card bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
      <div className="relative h-44 bg-gray-100">
        {article.image_url ? (
          <Image src={article.image_url} alt={article.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        ) : (
          <div className="w-full h-full img-placeholder">
            <span className="text-4xl">📰</span>
          </div>
        )}
        <span className={`absolute top-2 left-2 category-badge text-white ${catColor}`}>{catLabel}</span>
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="font-bold text-gray-900 group-hover:text-red-700 transition-colors line-clamp-3 text-sm sm:text-base leading-snug mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mb-3">{article.excerpt}</p>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="truncate">{article.source || 'GhanaFront'}</span>
          <span>•</span>
          <span className="flex-shrink-0">{formatDate(article.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}
