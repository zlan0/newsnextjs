'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Tab = 'dashboard' | 'articles' | 'scrapped' | 'post' | 'sources' | 'settings';

interface Article {
  id: number;
  title: string;
  slug: string;
  category: string;
  source: string;
  status: string;
  is_scraped: number;
  is_ai_rewritten: number;
  views: number;
  created_at: string;
}

interface Stats {
  total: number;
  published: number;
  scraped: number;
  ai_rewritten: number;
}

const CATEGORY_OPTIONS = ['general', 'politics', 'business', 'sports', 'entertainment', 'health', 'technology'];

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [authenticated, setAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const stored = sessionStorage.getItem('gf_admin_auth');
    if (stored === 'true') setAuthenticated(true);
    setAuthLoading(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      if (res.ok) {
        sessionStorage.setItem('gf_admin_auth', 'true');
        setAuthenticated(true);
      } else {
        setLoginError('Invalid username or password');
      }
    } catch (e) {
      setLoginError('Connection error. Please try again.');
    }
  };

  if (authLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" /></div>;

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="ghana-stripe h-1 w-20 mx-auto mb-4 rounded" />
            <h1 className="text-2xl font-black" style={{ fontFamily: 'Playfair Display, serif' }}>
              Ghana<span className="text-red-700">Front</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">Admin Panel</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">{loginError}</div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={e => setLoginForm(f => ({ ...f, username: e.target.value }))}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                required
              />
            </div>
            <button type="submit" className="w-full py-3 bg-red-700 text-white font-bold rounded-lg hover:bg-red-800 transition-colors">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <aside className="admin-sidebar bg-gray-900 text-white flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-gray-700">
          <div className="text-lg font-black" style={{ fontFamily: 'Playfair Display, serif' }}>
            Ghana<span className="text-red-500">Front</span>
          </div>
          <div className="text-xs text-gray-400 mt-0.5">Admin Panel</div>
        </div>
        
        <nav className="flex-1 p-3 space-y-1">
          {[
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'post', icon: '✏️', label: 'Post Article' },
            { id: 'articles', icon: '📰', label: 'All Articles' },
            { id: 'scrapped', icon: '🤖', label: 'Scraped Articles' },
            { id: 'sources', icon: '🌐', label: 'News Sources' },
            { id: 'settings', icon: '⚙️', label: 'Settings' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id as Tab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                tab === item.id ? 'bg-red-700 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="p-3 border-t border-gray-700">
          <a href="/" target="_blank" className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors px-3 py-2">
            <span>🌐</span><span>View Website</span>
          </a>
          <button
            onClick={() => { sessionStorage.removeItem('gf_admin_auth'); setAuthenticated(false); }}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors px-3 py-2 w-full"
          >
            <span>🚪</span><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile header */}
        <div className="lg:hidden bg-gray-900 text-white p-3 flex items-center justify-between sticky top-0 z-30">
          <span className="font-black" style={{ fontFamily: 'Playfair Display, serif' }}>Ghana<span className="text-red-500">Front</span> Admin</span>
          <select
            value={tab}
            onChange={e => setTab(e.target.value as Tab)}
            className="bg-gray-700 text-white text-sm px-2 py-1 rounded border-0"
          >
            <option value="dashboard">Dashboard</option>
            <option value="post">Post Article</option>
            <option value="articles">All Articles</option>
            <option value="scrapped">Scraped Articles</option>
            <option value="sources">News Sources</option>
            <option value="settings">Settings</option>
          </select>
        </div>

        <div className="p-4 sm:p-6">
          {tab === 'dashboard' && <DashboardTab />}
          {tab === 'post' && <PostArticleTab />}
          {tab === 'articles' && <ArticlesTab showScraped={false} />}
          {tab === 'scrapped' && <ArticlesTab showScraped={true} />}
          {tab === 'sources' && <SourcesTab />}
          {tab === 'settings' && <SettingsTab />}
        </div>
      </main>
    </div>
  );
}

// DASHBOARD TAB
function DashboardTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState('');

  useEffect(() => {
    fetch('/api/admin/articles?stats=true')
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(console.error);
  }, []);

  const triggerScrape = async (type: 'scrape' | 'rss') => {
    setScraping(true);
    setScrapeResult('');
    try {
      const res = await fetch(`/api/cron/${type}`, { method: 'GET' });
      const data = await res.json();
      setScrapeResult(type === 'rss'
        ? `RSS fetch complete: ${data.added} new articles added, ${data.failed} failed`
        : `Scrape complete: ${data.added} new articles added, ${data.failed} failed`);
    } catch (e) {
      setScrapeResult('Error occurred. Check console.');
    } finally {
      setScraping(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Dashboard</h2>
      
      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Articles', value: stats?.total ?? '—', color: 'bg-blue-500', icon: '📰' },
          { label: 'Published', value: stats?.published ?? '—', color: 'bg-green-500', icon: '✅' },
          { label: 'Scraped', value: stats?.scraped ?? '—', color: 'bg-purple-500', icon: '🤖' },
          { label: 'AI Rewritten', value: stats?.ai_rewritten ?? '—', color: 'bg-yellow-500', icon: '✨' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-black text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500 font-medium mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => triggerScrape('rss')}
            disabled={scraping}
            className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {scraping ? '⏳ Fetching...' : '📡 Fetch RSS Now'}
          </button>
          <button
            onClick={() => triggerScrape('scrape')}
            disabled={scraping}
            className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {scraping ? '⏳ Scraping...' : '🕷️ Scrape Now'}
          </button>
          <a href="?tab=post" onClick={e => { e.preventDefault(); document.querySelector<HTMLButtonElement>('[data-tab="post"]')?.click(); }} className="px-5 py-2.5 bg-red-700 text-white font-semibold rounded-lg hover:bg-red-800 transition-colors">
            ✏️ Write Article
          </a>
        </div>
        {scrapeResult && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium">
            ✅ {scrapeResult}
          </div>
        )}
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>🕐</span> Auto-Scheduling
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>RSS fetch</span>
              <span className="font-mono text-green-600">Every 30 min</span>
            </div>
            <div className="flex justify-between">
              <span>Web scraping</span>
              <span className="font-mono text-green-600">Every hour</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Powered by Vercel Cron (free tier)</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>⚡</span> Setup Status
          </h3>
          <div className="space-y-2 text-sm">
            <StatusItem label="Database" ok={true} />
            <StatusItem label="RSS Sources" ok={true} />
            <StatusItem label="Auto Cron" ok={true} />
            <StatusItem label="AI Rewriting" ok={!!process.env.OPENROUTER_API_KEY} msg="(add OPENROUTER_API_KEY)" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusItem({ label, ok, msg }: { label: string; ok: boolean; msg?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={ok ? 'text-green-500' : 'text-yellow-500'}>{ok ? '✅' : '⚠️'}</span>
      <span className={ok ? 'text-gray-700' : 'text-gray-500'}>{label}</span>
      {!ok && msg && <span className="text-xs text-gray-400">{msg}</span>}
    </div>
  );
}

// POST ARTICLE TAB
function PostArticleTab() {
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'general',
    source: '',
    source_url: '',
    image_url: '',
    author: 'GhanaFront Staff',
    status: 'published',
  });
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ ok?: boolean; message?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setResult({});
    try {
      const res = await fetch('/api/admin/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ ok: true, message: `Article published! Slug: ${data.slug}` });
        setForm(f => ({ ...f, title: '', content: '', image_url: '', source: '', source_url: '' }));
      } else {
        setResult({ ok: false, message: data.error || 'Failed to save' });
      }
    } catch (e) {
      setResult({ ok: false, message: 'Network error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Post New Article</h2>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {result.message && (
            <div className={`p-3 rounded-lg text-sm font-medium ${result.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {result.ok ? '✅' : '❌'} {result.message}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 text-sm"
              placeholder="Article title..."
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 text-sm"
              >
                {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 text-sm"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Content * (minimum 300 words recommended)</label>
            <textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              rows={12}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 text-sm font-mono"
              placeholder="Write your article content here... Use blank lines to separate paragraphs."
              required
            />
            <p className="text-xs text-gray-400 mt-1">Words: {form.content.split(/\s+/).filter(Boolean).length}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Author</label>
              <input
                type="text"
                value={form.author}
                onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                value={form.image_url}
                onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 text-sm"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Source Name</label>
              <input
                type="text"
                value={form.source}
                onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 text-sm"
                placeholder="e.g. Ghana Broadcasting Corporation"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Source URL</label>
              <input
                type="url"
                value={form.source_url}
                onChange={e => setForm(f => ({ ...f, source_url: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 text-sm"
                placeholder="https://..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-red-700 text-white font-bold rounded-lg hover:bg-red-800 disabled:opacity-50 transition-colors"
          >
            {saving ? '⏳ Publishing...' : '🚀 Publish Article'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ARTICLES TAB
function ArticlesTab({ showScraped }: { showScraped: boolean }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const url = showScraped ? '/api/admin/articles?scraped=true' : '/api/admin/articles';
      const res = await fetch(url);
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadArticles(); }, [showScraped]);

  const deleteArticle = async (id: number) => {
    if (!confirm('Delete this article?')) return;
    setDeleting(id);
    try {
      await fetch(`/api/admin/articles?id=${id}`, { method: 'DELETE' });
      setArticles(a => a.filter(art => art.id !== id));
    } catch (e) {}
    setDeleting(null);
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    try {
      await fetch('/api/admin/articles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      setArticles(a => a.map(art => art.id === id ? { ...art, status: newStatus } : art));
    } catch (e) {}
  };

  const filtered = articles.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    (a.source || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          {showScraped ? '🤖 Scraped Articles' : '📰 All Articles'} ({articles.length})
        </h2>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search articles..."
          className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-500 sm:w-64"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-16 skeleton rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No articles found.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Title</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden sm:table-cell">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden md:table-cell">Source</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(article => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <div>
                          <div className="font-medium text-gray-900 line-clamp-1 max-w-xs">{article.title}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {article.is_ai_rewritten ? '✨ AI' : ''} {new Date(article.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded font-medium capitalize">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell max-w-xs truncate">
                      {article.source || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStatus(article.id, article.status)}
                        className={`text-xs font-semibold px-2 py-1 rounded ${article.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                      >
                        {article.status}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/article/${article.slug}`}
                          target="_blank"
                          className="text-blue-600 hover:underline text-xs"
                        >
                          View
                        </a>
                        <button
                          onClick={() => deleteArticle(article.id)}
                          disabled={deleting === article.id}
                          className="text-red-600 hover:text-red-800 text-xs disabled:opacity-50"
                        >
                          {deleting === article.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// SOURCES TAB
function SourcesTab() {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRss, setNewRss] = useState({ name: '', url: '', category: 'general' });
  const [adding, setAdding] = useState(false);
  const [tab, setTab] = useState<'rss' | 'scrape'>('rss');

  const loadSources = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/sources?type=${tab}`);
      const data = await res.json();
      setSources(data.sources || []);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { loadSources(); }, [tab]);

  const addSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await fetch('/api/admin/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newRss, type: tab }),
      });
      setNewRss({ name: '', url: '', category: 'general' });
      loadSources();
    } catch (e) {}
    setAdding(false);
  };

  const toggleSource = async (id: number, active: number) => {
    await fetch('/api/admin/sources', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, active: active ? 0 : 1, type: tab }),
    });
    loadSources();
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-bold text-gray-800 mb-6">News Sources</h2>
      
      {/* Tab switch */}
      <div className="flex border-b border-gray-200 mb-6">
        <button onClick={() => setTab('rss')} className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px ${tab === 'rss' ? 'border-red-700 text-red-700' : 'border-transparent text-gray-500'}`}>
          RSS Sources
        </button>
        <button onClick={() => setTab('scrape')} className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px ${tab === 'scrape' ? 'border-red-700 text-red-700' : 'border-transparent text-gray-500'}`}>
          Scrape Sources
        </button>
      </div>

      {/* Add form */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <h3 className="font-semibold text-gray-700 mb-4">Add New {tab === 'rss' ? 'RSS' : 'Scrape'} Source</h3>
        <form onSubmit={addSource} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={newRss.name}
              onChange={e => setNewRss(f => ({ ...f, name: e.target.value }))}
              placeholder="Source name"
              className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-500"
              required
            />
            <select
              value={newRss.category}
              onChange={e => setNewRss(f => ({ ...f, category: e.target.value }))}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-500"
            >
              {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <input
            type="url"
            value={newRss.url}
            onChange={e => setNewRss(f => ({ ...f, url: e.target.value }))}
            placeholder={tab === 'rss' ? 'RSS feed URL (https://example.com/feed)' : 'Website URL (https://example.com)'}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-500"
            required
          />
          <button type="submit" disabled={adding} className="px-5 py-2 bg-red-700 text-white font-semibold rounded-lg text-sm hover:bg-red-800 disabled:opacity-50 transition-colors">
            {adding ? 'Adding...' : '+ Add Source'}
          </button>
        </form>
      </div>

      {/* Sources list */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 skeleton rounded" />)}</div>
        ) : sources.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No sources yet</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sources.map(src => (
              <div key={src.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="font-medium text-sm text-gray-900">{src.name}</div>
                  <div className="text-xs text-gray-400 truncate max-w-xs">{src.url}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 capitalize">{src.category}</span>
                  <button
                    onClick={() => toggleSource(src.id, src.active)}
                    className={`text-xs font-semibold px-3 py-1 rounded ${src.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {src.active ? 'Active' : 'Paused'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// SETTINGS TAB
function SettingsTab() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Settings</h2>
      
      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">Environment Variables</h3>
          <p className="text-sm text-gray-600 mb-4">
            These settings are configured in your Vercel project environment variables or <code className="bg-gray-100 px-1 rounded">.env.local</code> file.
          </p>
          <div className="space-y-3 text-sm">
            {[
              { key: 'TURSO_DATABASE_URL', desc: 'Your Turso database URL (required)', required: true },
              { key: 'TURSO_AUTH_TOKEN', desc: 'Your Turso auth token (required)', required: true },
              { key: 'ADMIN_USERNAME', desc: 'Admin login username', required: false },
              { key: 'ADMIN_PASSWORD', desc: 'Admin login password', required: false },
              { key: 'OPENROUTER_API_KEY', desc: 'AI rewriting API key (free tier available at openrouter.ai)', required: false },
              { key: 'NEXTAUTH_SECRET', desc: '32+ char random string for JWT', required: false },
            ].map(item => (
              <div key={item.key} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <code className="text-xs font-mono bg-gray-200 px-2 py-1 rounded text-gray-800 flex-shrink-0">{item.key}</code>
                <span className="text-gray-600">{item.desc} {item.required && <span className="text-red-600 font-semibold">*required</span>}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">Google AdSense Setup</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>1. Apply for Google AdSense at <a href="https://www.google.com/adsense" target="_blank" className="text-red-600 hover:underline">google.com/adsense</a></p>
            <p>2. Add your AdSense script to <code className="bg-gray-100 px-1 rounded">app/layout.tsx</code></p>
            <p>3. Replace the ad placeholders in the article pages with real AdSense units</p>
            <p className="text-yellow-700 bg-yellow-50 p-3 rounded-lg mt-3">⚠️ For AdSense approval, ensure your site has at least 20+ quality articles (500+ words each). The AI rewriting feature helps with this!</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">Free Hosting Guide</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Frontend + API:</strong> Vercel (free) — <a href="https://vercel.com" target="_blank" className="text-red-600 hover:underline">vercel.com</a></p>
            <p><strong>Database:</strong> Turso SQLite (free 500MB) — <a href="https://turso.tech" target="_blank" className="text-red-600 hover:underline">turso.tech</a></p>
            <p><strong>AI Rewriting:</strong> OpenRouter free models — <a href="https://openrouter.ai" target="_blank" className="text-red-600 hover:underline">openrouter.ai</a></p>
            <p><strong>Auto Scraping:</strong> Vercel Cron (free, every 30min/1hr) — included</p>
            <p><strong>Domain:</strong> Use Vercel subdomain free or add custom domain</p>
            <p className="text-green-700 bg-green-50 p-3 rounded-lg mt-3">✅ Total cost: $0/month for a fully functional news website!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
