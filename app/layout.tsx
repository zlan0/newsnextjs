import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: {
    default: 'GhanaFront - Ghana\'s Latest News',
    template: '%s | GhanaFront',
  },
  description: 'Ghana\'s Premier News Source - Politics, Business, Sports & Entertainment',
  keywords: 'Ghana news, Ghana politics, Ghana business, Accra, GhanaWeb, African news',
  openGraph: {
    type: 'website',
    locale: 'en_GH',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'GhanaFront',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Source+Sans+3:wght@300;400;600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-gray-50 font-sans">
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
