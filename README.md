# 🇬🇭 GhanaFront - Complete News Website

A fully-featured, mobile-responsive Ghanaian news website built with Next.js 14, featuring automatic news scraping, RSS feeds, AI article rewriting, and a complete admin panel.

## ✅ Features

- **Mobile-first responsive design** — Works perfectly on all devices
- **Auto news scraping** — Scrapes Ghanaian news sites every hour (Vercel Cron)
- **RSS feed aggregation** — Pulls from 7+ Ghana news RSS feeds every 30 minutes
- **AI article rewriting** — Rewrites scraped articles to 500-900 words using free AI
- **Persistent database** — Data stored in Turso (cloud SQLite) — never loses data
- **Admin panel** — Full dashboard with post/manage/scrape controls
- **AdSense ready** — Placeholder slots for Google AdSense monetization
- **SEO optimized** — Meta tags, OpenGraph, structured markup
- **Search** — Full text search across all articles
- **Categories** — Politics, Business, Sports, Entertainment, Health, Technology

## 🆓 100% Free Stack

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| **Vercel** | Hosting + API + Cron | ✅ Free forever |
| **Turso** | Cloud SQLite Database | ✅ 500MB free |
| **OpenRouter** | AI article rewriting | ✅ Free models available |

**Total monthly cost: $0**

## 🚀 Deployment Guide (30 minutes)

### Step 1: Get Turso Database (Free)

1. Go to [turso.tech](https://turso.tech) and sign up (free)
2. Click "Create Database"
3. Name it `ghanafront`
4. Copy your database URL (looks like `libsql://ghanafront-yourname.turso.io`)
5. Go to "Tokens" and create an auth token
6. Save both values

### Step 2: Deploy to Vercel

1. Push this code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial GhanaFront deployment"
   # Create a repo on github.com, then:
   git remote add origin https://github.com/yourusername/ghanafront.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) and click "New Project"
3. Import your GitHub repository
4. Add these environment variables:
   ```
   TURSO_DATABASE_URL = libsql://your-db.turso.io
   TURSO_AUTH_TOKEN = your_token_here
   ADMIN_USERNAME = admin
   ADMIN_PASSWORD = YourSecurePassword123!
   NEXTAUTH_SECRET = anyrandom32characterstring1234567890
   NEXT_PUBLIC_SITE_URL = https://your-project.vercel.app
   ```
5. Click Deploy!

### Step 3: Get Free AI Rewriting (Optional but Recommended)

1. Sign up at [openrouter.ai](https://openrouter.ai) (free)
2. Create an API key
3. Add to Vercel: `OPENROUTER_API_KEY = sk-or-...`
4. Free models include: Mistral 7B, Llama 3, Gemma — all sufficient for news rewriting

### Step 4: Initialize & Start

1. Visit `https://your-site.vercel.app/api/cron/rss` to do first RSS fetch
2. Visit `https://your-site.vercel.app/admin` to access admin panel
3. Login with your admin credentials

## 📱 Admin Panel

Access at `/admin`:

| Tab | Function |
|-----|---------|
| **Dashboard** | Stats, manual scrape trigger |
| **Post Article** | Write and publish articles manually |
| **All Articles** | View, manage, delete all articles |
| **Scraped Articles** | View only auto-scraped articles |
| **News Sources** | Add/remove/toggle RSS and scrape sources |
| **Settings** | Configuration guide |

## 💰 Google AdSense Setup

1. Apply at [google.com/adsense](https://www.google.com/adsense)
2. Your site needs 20+ quality articles (the AI rewriting helps!)
3. Add your AdSense publisher ID script to `app/layout.tsx`
4. Replace the placeholder `<!-- AdSense slot -->` comments with real units

## 📰 Default RSS Sources Included

- GhanaWeb
- Graphic Online
- Ghana Business News
- 3News
- JoyFM Online
- CitiFM Online
- Football Ghana

## ⚙️ Cron Schedule — Free Setup

Vercel Hobby (free) only allows **1 cron per day**. Use **GitHub Actions** for frequent free scraping.

### Option A: GitHub Actions ✅ Recommended (Every 2 Hours, Free)

GitHub gives 2,000 free Actions minutes/month. Each scrape run ≈ 30 seconds → ~180 min/month used.

**Setup:**
1. Push code to GitHub
2. Go to repo → **Settings → Secrets → Actions**
3. Add these secrets:
   - `SITE_URL` = `https://your-project.vercel.app`
   - `CRON_SECRET` = any random string (e.g. `mySecret123`)
4. Add same `CRON_SECRET` to Vercel environment variables
5. Workflow in `.github/workflows/scraper-cron.yml` runs every 2 hours automatically ✅

### Option B: cron-job.org (Free External Cron — Every 30 Min)

Sign up free at [cron-job.org](https://cron-job.org), create two jobs:
- URL: `https://your-site.vercel.app/api/cron/rss` — every 30 min
- URL: `https://your-site.vercel.app/api/cron/scrape` — every hour
- Add header: `Authorization: Bearer yourCronSecret`

### Option C: Vercel Cron (Daily Fallback — Already Configured)

`vercel.json` runs once per day at 6am as a guaranteed fallback. No setup needed.

## 🔧 Local Development

```bash
npm install
cp .env.example .env.local
# Fill in your Turso credentials in .env.local
npm run dev
```

## 📁 Project Structure

```
ghanafront/
├── app/
│   ├── page.tsx              # Homepage
│   ├── article/[slug]/       # Article detail page
│   ├── category/[category]/  # Category listing
│   ├── search/               # Search page
│   ├── admin/                # Full admin panel
│   └── api/
│       ├── cron/rss/         # RSS fetch (Vercel Cron)
│       ├── cron/scrape/      # Web scraper (Vercel Cron)
│       ├── admin/            # Admin API routes
│       └── articles/         # Public API
├── components/
│   ├── layout/Header.tsx     # Mobile responsive header
│   ├── layout/Footer.tsx     # Footer
│   └── news/ArticleCard.tsx  # Article card variants
├── lib/
│   ├── db.ts                 # Turso database client
│   ├── scraper.ts            # Web scraper + AI rewriter
│   ├── rss.ts                # RSS parser
│   └── utils.ts              # Helpers
└── vercel.json               # Cron configuration
```

## 🤔 Troubleshooting

**Articles not showing:** Check Turso credentials are correct in Vercel env vars

**Scraping not working:** Some sites block scrapers. RSS feeds are more reliable

**AI rewriting off:** Add OPENROUTER_API_KEY — use free models like `mistralai/mistral-7b-instruct:free`

**AdSense rejected:** Need 20+ unique articles and original content — use AI rewriting

---

Built for Ghana 🇬🇭 — Ready for mass market deployment
