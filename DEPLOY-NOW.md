# Deploy Spudlicious to Vercel — Do This Now

Everything in this `dist/` folder is production-ready:
- ✅ Real WhatsApp number (+973 3326 0007) in all order/catering links + QR
- ✅ Hours: 7PM–12AM (display, open/closed badge, and structured data)
- ✅ Email removed (customers use WhatsApp)
- ✅ Review videos compressed for web (bundle is 268 MB, down from 6.1 GB)
- ✅ 0 console errors, 0 broken media — verified across all pages

**Deploy from the `dist/` folder** (not the project root — the root still has the 6 GB of
master originals, which must NOT be uploaded).

---

## Option A — Vercel CLI (fastest, ~2 minutes)

Open Terminal and run:

```bash
# 1. Install the Vercel CLI (one time)
npm i -g vercel

# 2. Go to the deploy folder
cd /Users/doha/spudslicious/dist

# 3. Deploy (it will ask you to log in the first time)
vercel --prod
```

When prompted:
- **Set up and deploy?** → `Y`
- **Which scope?** → your account
- **Link to existing project?** → `N` (first time)
- **Project name?** → `spudlicious` (or anything)
- **In which directory is your code?** → `./` (you're already in `dist`)
- **Override settings?** → `N`

It prints a live URL like `https://spudlicious-xxxx.vercel.app` — that's your site, live.

---

## Option B — Vercel Dashboard (no terminal)

1. Zip the **contents** of `dist/` (not the folder itself).
2. Go to **vercel.com** → log in → **Add New… → Project → deploy**.
3. Drag the zip / folder in. Vercel detects it as a static site (no build needed).
4. Deploy → you get a live `*.vercel.app` URL.

---

## After it's live

1. **Test the live URL:** open it, add a spud, tap Order → confirm WhatsApp opens
   `wa.me/97333260007` with a prefilled message.
2. **Connect your domain `spudlicious.bh`:** Vercel dashboard → Project → **Settings →
   Domains** → add `spudlicious.bh` → follow the DNS instructions (add the records Vercel
   shows at your domain registrar). HTTPS is automatic.
3. **Submit to search:** once the domain is live, add the site to Google Search Console and
   submit `https://spudlicious.bh/sitemap.xml`.
4. **Optional later:** Google Analytics (paste the ID in `<head>`), Google Business Profile,
   Apple Business Connect.

---

## Redeploying after future edits
Re-copy the changed files from the project into `dist/`, **bump `CACHE_VERSION` in `sw.js`**,
and run `vercel --prod` again (or re-drag in the dashboard). Vercel keeps every deploy, so
you can roll back in one click.
```
