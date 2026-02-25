export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 100);
}

export function generateExcerpt(content: string, maxLength = 200): string {
  const clean = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  const truncated = clean.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 100 ? truncated.substring(0, lastSpace) : truncated) + '...';
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function contentToHtml(content: string): string {
  if (content.includes('<p>') || content.includes('<div>')) return content;
  
  return content
    .split('\n\n')
    .filter(p => p.trim().length > 0)
    .map(p => `<p>${p.trim()}</p>`)
    .join('\n');
}

export const CATEGORIES = [
  { slug: 'general', label: 'General', color: '#333' },
  { slug: 'politics', label: 'Politics', color: '#CF0921' },
  { slug: 'business', label: 'Business', color: '#006B3F' },
  { slug: 'sports', label: 'Sports', color: '#0066CC' },
  { slug: 'entertainment', label: 'Entertainment', color: '#9333EA' },
  { slug: 'health', label: 'Health', color: '#16A34A' },
  { slug: 'technology', label: 'Technology', color: '#0891B2' },
];
