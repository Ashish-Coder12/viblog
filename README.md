# YT Blog — YouTube to Blog Post Generator

Turn any YouTube video into a complete blog post using AI. Paste a URL → get transcript → Claude generates title, description & hashtags → saved to your dashboard.

## Stack

- **Next.js 15** — App Router, Server Components, API Routes
- **Clerk** — Authentication (login, signup, session management)
- **Supabase** — PostgreSQL database with Row Level Security
- **Claude AI** (Anthropic) — Blog content generation
- **youtube-transcript** — Fetches video captions

## Project Structure

```
yt-blog/
├── app/
│   ├── api/
│   │   └── blogs/
│   │       ├── generate/route.ts   # POST (generate) + GET (list) blogs
│   │       └── [id]/route.ts       # DELETE a blog
│   ├── blog/[id]/page.tsx          # Individual blog view
│   ├── dashboard/page.tsx          # Main dashboard
│   ├── sign-in/[[...sign-in]]/     # Clerk sign-in
│   ├── sign-up/[[...sign-up]]/     # Clerk sign-up
│   ├── layout.tsx                  # Root layout with ClerkProvider
│   ├── page.tsx                    # Landing page
│   └── globals.css
├── components/
│   └── DeleteBlogButton.tsx        # Client component for delete
├── lib/
│   ├── ai.ts                       # Claude AI integration
│   ├── supabase.ts                 # Supabase client setup
│   └── youtube.ts                  # Transcript fetching + video ID utils
├── types/index.ts                  # TypeScript types
├── middleware.ts                   # Clerk route protection
└── supabase-schema.sql             # Run this in Supabase SQL editor
```

## Setup Guide

### 1. Clone & install

```bash
git clone <your-repo>
cd yt-blog
npm install
```

### 2. Set up Clerk

1. Go to [clerk.com](https://clerk.com) → create a new application
2. Copy your **Publishable Key** and **Secret Key**
3. In Clerk dashboard → configure redirect URLs:
   - Sign-in redirect: `/dashboard`
   - Sign-up redirect: `/dashboard`

### 3. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → create a new project
2. Go to **SQL Editor** → paste and run the contents of `supabase-schema.sql`
3. Go to **Project Settings → API** → copy:
   - **Project URL**
   - **anon/public key**
   - **service_role key** (keep this secret!)

### 4. Set up Anthropic (Claude)

1. Go to [console.anthropic.com](https://console.anthropic.com) → API Keys
2. Create a new API key

### 5. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in all values in `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

ANTHROPIC_API_KEY=sk-ant-...
```

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How It Works

1. **User signs in** via Clerk (Google, email, etc.)
2. **User pastes a YouTube URL** on the dashboard
3. **API route** `/api/blogs/generate`:
   - Validates the URL and extracts the video ID
   - Calls `youtube-transcript` to fetch captions
   - Sends the transcript to Claude AI with a prompt to generate title, description (400–600 words), and 10 hashtags
   - Saves the result to Supabase with the user's Clerk ID
4. **Dashboard updates** in real time showing the new blog card
5. **Blog detail page** shows the full content, thumbnail, hashtags, and original transcript

## Notes

- Videos must have captions/subtitles enabled on YouTube
- Generation takes ~10–20 seconds (transcript fetch + Claude API call)
- Transcripts are truncated to ~12,000 words to stay within token limits
- Each user only sees their own blogs (enforced both via Supabase RLS and API-level `.eq('user_id', userId)` checks)

## Deployment (Vercel)

```bash
npm run build   # verify it builds
vercel deploy
```

Add all environment variables in the Vercel project dashboard under **Settings → Environment Variables**.
