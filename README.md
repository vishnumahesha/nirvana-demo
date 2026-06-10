# Mirawatch + Nirvana Systems Demo

This repo contains two things:

1. **Mirawatch** — a Next.js movie and TV streaming app powered by TMDB.
2. **Nirvana Systems / OmniFunds demo** — a single-page marketing site mockup built to preview an embedded ElevenLabs AI support widget on a real-looking trading-software landing page.

---

## Live URLs

| Page | URL |
|------|-----|
| Mirawatch home | https://mirawatch.vercel.app |
| Nirvana demo | https://mirawatch.vercel.app/nirvana |

---

## Nirvana Demo

**Route:** `/nirvana`

A pixel-close replica of the Nirvana Systems / OmniFunds marketing site used as a visual prototype. It shows how an embedded AI support widget looks and behaves in the context of a real fintech landing page.

### What's on the page

- Hero sections with pastel accent blobs (lavender, mint)
- "Explore Our Technology" — 5-tab interactive section
- Performance charts (SVG placeholder line charts with stats)
- Flagship Solutions — three fund pricing cards (Inverse ETFs, NAS100 & R3K, AI Mixed Growth)
- Testimonials grid with real customer quotes
- Team section (Ed Downs, Jeff Drake, Constantin Craus)
- 12-Month Satisfaction Guarantee section
- FAQ accordion (8 questions including real cost answer)
- Footer with email subscribe

### ElevenLabs AI Widget

The page embeds a live ElevenLabs conversational AI widget via the official embed:

```html
<elevenlabs-convai agent-id="agent_9101ktsc5gmpe5dszbas6a8w9n96"></elevenlabs-convai>
```

The CDN script is loaded in `app/layout.tsx` via `next/script` with `strategy="afterInteractive"`. The custom element is rendered client-side in `app/nirvana/_components/ElevenLabsWidget.tsx` using `dangerouslySetInnerHTML` to avoid TypeScript intrinsic-element type errors.

### Tech

- Next.js 16 App Router, TypeScript, Tailwind CSS
- Fonts: Fraunces (display headlines) + Sora (body) via `next/font/google`
- No external image assets — all charts are inline SVGs
- Fully responsive, mobile-first (375px minimum)

---

## Mirawatch

A movie and TV browser backed by the TMDB API. Browse, search, and stream titles from any device.

### Features

- Home feed with curated rows (trending, top-rated, by genre)
- Movie and TV detail pages
- Search
- Watchlist (localStorage)
- Embedded player with source switcher and error detection
- Ad blocker recommendations page

### Stack

- Next.js 16 App Router + TypeScript
- Tailwind CSS + shadcn/ui
- TMDB API for metadata
- Vidking for stream sources
- Vercel for hosting

---

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000 for Mirawatch or http://localhost:3000/nirvana for the demo.

Copy `.env.example` to `.env.local` and fill in your TMDB API key before running.

---

## GitHub

https://github.com/vishnumahesha/nirvana-demo
