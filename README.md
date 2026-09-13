# Half & Full — Next.js + Supabase

This project is designed for a restaurant menu where the public website is responsive and the admin can permanently manage:
- item name/category
- half/full prices
- item image
- add/delete items
- hero/banner images
- search, category filter and price/name sorting

## Why changes stay after deployment
Menu records are stored in Supabase Postgres, not Render/Vercel local disk.
Images are stored in a Supabase Storage public bucket named `restaurant-images`.

## Setup

1. Create a Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. Create a PUBLIC Storage bucket named `restaurant-images`.
4. Copy `.env.example` to `.env.local` and fill:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - ADMIN_USERNAME=prakhar11
   - ADMIN_PASSWORD=prakhar112233
   - ADMIN_SESSION_SECRET = a long random secret
5. Run:
   npm install
   npm run dev

Admin: `/admin/login`

## Vercel deployment
Add the same environment variables in Vercel Project Settings → Environment Variables, then redeploy.

IMPORTANT:
`SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` must never use the `NEXT_PUBLIC_` prefix.

The included admin credential is exactly the requested credential. For a real production restaurant, change it to a stronger secret and preferably use Supabase Auth.
