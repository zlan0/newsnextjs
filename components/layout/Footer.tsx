import Link from 'next/link';
import { CATEGORIES } from '@/lib/utils';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-12 pb-16 sm:pb-0">
      <div className="ghana-stripe" />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="block mb-3">
              <span className="text-2xl font-black text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                Ghana<span className="text-red-500">Front</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Ghana's premier digital news platform. Delivering accurate, timely news from across the country.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-3">Categories</h3>
            <ul className="space-y-1.5">
              {CATEGORIES.map(cat => (
                <li key={cat.slug}>
                  <Link href={`/category/${cat.slug}`} className="text-sm hover:text-red-400 transition-colors">
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-3">Quick Links</h3>
            <ul className="space-y-1.5 text-sm">
              <li><Link href="/" className="hover:text-red-400 transition-colors">Latest News</Link></li>
              <li><Link href="/search" className="hover:text-red-400 transition-colors">Search</Link></li>
              <li><Link href="/admin" className="hover:text-red-400 transition-colors">Admin Panel</Link></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-3">About</h3>
            <ul className="space-y-1.5 text-sm">
              <li><span className="text-gray-500">GhanaFront © {new Date().getFullYear()}</span></li>
              <li><span className="text-gray-500">Accra, Ghana</span></li>
              <li><span className="text-gray-500">All rights reserved</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} GhanaFront. Ghana's News Leader. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
