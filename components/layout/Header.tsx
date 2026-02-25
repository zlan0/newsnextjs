'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CATEGORIES } from '@/lib/utils';

const navCategories = [
  { href: '/', label: 'Home' },
  ...CATEGORIES.slice(1).map(c => ({ href: `/category/${c.slug}`, label: c.label })),
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      {/* Top bar */}
      <div className="bg-gray-900 text-gray-300 text-xs px-4 py-1 hidden sm:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span>{new Date().toLocaleDateString('en-GH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <div className="flex gap-4">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="ghana-stripe" />
        
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="flex flex-col leading-none">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Ghana<span className="text-red-700">Front</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-gray-500 uppercase">Ghana's News Leader</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navCategories.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-semibold transition-colors rounded ${
                    pathname === item.href 
                      ? 'text-red-700 bg-red-50' 
                      : 'text-gray-700 hover:text-red-700 hover:bg-red-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Search toggle */}
              <button 
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-gray-600 hover:text-red-700 transition-colors"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-red-700 transition-colors"
                aria-label="Menu"
              >
                {menuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Search bar */}
          {searchOpen && (
            <div className="pb-3">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search Ghana news..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-red-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-700 text-white rounded-lg text-sm font-semibold hover:bg-red-800 transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white">
            <nav className="max-w-7xl mx-auto px-4 py-2 grid grid-cols-3 gap-1">
              {navCategories.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`px-2 py-2 text-sm font-semibold text-center rounded transition-colors ${
                    pathname === item.href
                      ? 'text-white bg-red-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Breaking news ticker */}
      <BreakingNewsTicker />

      {/* Mobile bottom nav */}
      <nav className="mobile-nav no-print">
        {[
          { href: '/', label: 'Home', icon: '🏠' },
          { href: '/category/politics', label: 'Politics', icon: '🏛️' },
          { href: '/category/sports', label: 'Sports', icon: '⚽' },
          { href: '/category/business', label: 'Business', icon: '💼' },
          { href: '/search', label: 'Search', icon: '🔍' },
        ].map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-semibold transition-colors ${
              pathname === item.href ? 'text-red-700' : 'text-gray-500'
            }`}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}

// Breaking news ticker
async function getBreakingNews(): Promise<string[]> {
  return [
    'Welcome to GhanaFront - Ghana\'s Premier News Source',
    'Latest news from across Ghana, updated every hour',
  ];
}

function BreakingNewsTicker() {
  return (
    <div className="bg-red-700 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center">
        <span className="bg-red-900 text-white text-xs font-bold px-3 py-1.5 flex-shrink-0 uppercase tracking-wide">
          Breaking
        </span>
        <div className="ticker-container flex-1 py-1.5">
          <div className="ticker-content text-sm px-4">
            Ghana's latest news at your fingertips • Politics • Business • Sports • Entertainment • Technology • Health
            &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
            Stay informed with GhanaFront - Updated every hour
          </div>
        </div>
      </div>
    </div>
  );
}
