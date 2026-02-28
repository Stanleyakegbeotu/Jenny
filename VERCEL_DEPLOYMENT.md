# Vercel Deployment Guide - NENSHA JENNIFER

Deploy your Romance Author Platform to Vercel with production-ready configuration!

## Prerequisites

- ✅ GitHub account with `Jenny` repository pushed
- ✅ Vercel account (free at https://vercel.com)
- ✅ Supabase project created with database
- ✅ Supabase environment variables in `.env.local`

## Step 1: Create Vercel Account

1. Go to https://vercel.com
2. Click **Sign Up**
3. Choose **Continue with GitHub**
4. Authorize Vercel to access GitHub
5. Click **Import Project**

## Step 2: Import Project from GitHub

1. Select `Jenny` repository from your GitHub
2. Vercel auto-detects it's a **Vite** project ✓
3. Click **Import**

## Step 3: Configure Environment Variables

In the Vercel import screen, add:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-from-supabase
```

ℹ️ Get these from: **Supabase Dashboard** → **Project Settings** → **API** → **Keys**

## Step 4: Deploy

1. Click **Deploy**
2. Wait 2-3 minutes for build completion
3. You get a production URL: `https://jenny-xxx.vercel.app`

## Step 5: Verify Deployment

After deployment:
1. Click your Vercel deployment link
2. Test landing page loads correctly
3. Click logo 5 times to access admin dashboard
4. Verify subscribers list loads
5. Test subscribing from landing page

---

## Production Deployment Configuration

### vercel.json Configuration

Your project includes `vercel.json` with optimized settings:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev", 
  "installCommand": "npm install",
  "framework": "vite",
  "nodejs": "18.x",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**What this does:**
- ✅ Builds your Vite app
- ✅ Handles React Router by rewriting all routes to `/index.html` (fixes 404 on admin refresh)
- ✅ Uses Node 18.x runtime

### vite.config.ts Configuration

Vite is configured for both development and production:

```typescript
server: {
  port: 5173,
  strictPort: false,
  hmr: process.env.PROD ? false : {
    host: 'localhost',
    port: 5173,
    protocol: 'ws',
  },
}
```

**What this does:**
- ✅ Hot Module Replacement (HMR) for faster development
- ✅ Disables HMR in production (cleaner builds)
- ✅ Allows flexible port assignment

---

## Supabase Setup Required

### 1️⃣ Create Storage Buckets

Go to **Supabase Dashboard** → **Storage** → **Create a new bucket**

Create 3 PUBLIC buckets:

**Bucket 1: `book-covers`**
- Name: `book-covers`
- Public: ✅ Yes
- Click **Create bucket**

**Bucket 2: `author-images`**
- Name: `author-images`  
- Public: ✅ Yes
- Click **Create bucket**

**Bucket 3: `chapter-previews`**
- Name: `chapter-previews`
- Public: ✅ Yes
- Click **Create bucket**

### 2️⃣ Verify Database Tables

Your database should have these 8 tables (already created):
- ✅ books
- ✅ chapters
- ✅ subscribers  
- ✅ book_comments
- ✅ book_interactions
- ✅ analytics_events
- ✅ site_settings
- ✅ contact_messages

### 3️⃣ Verify RLS Policies

All tables have public RLS policies enabled:
- ✅ **SELECT** - Read all public data
- ✅ **INSERT** - Allow subscribers, comments, interactions
- ✅ **UPDATE** - Allow interaction updates

---

## GitHub Auto-Deployment

Every push to `main` branch automatically:
1. Triggers Vercel build
2. Runs `npm run build`
3. Deploys to production (2-3 minutes)

**To update your site:**
```bash
git add .
git commit -m "Your message"
git push origin main
```

---

## Troubleshooting

### Build Fails

**Error: `npm run build` fails**
- Check `.env.local` is NOT committed (should be in `.gitignore`)
- Verify environment variables are set in Vercel dashboard
- Clear Vercel cache: Project → Settings → General → Clear Cache

**Error: Missing Supabase URL/Key**
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are in Vercel dashboard
- Redeploy after adding variables

### App Deployed but Features Don't Work

**Subscribers list shows nothing**
- Verify `subscribers` table exists in Supabase
- Check table has data (subscribe on landing page first)
- Verify RLS SELECT policy exists

**Can't refresh admin dashboard (404 error)**
- This is fixed by `vercel.json` `rewrites` configuration ✓
- If still happening, check Vercel deployment shows latest code

**Storage uploads fail**
- Verify buckets exist: `book-covers`, `author-images`, `chapter-previews`
- Check buckets are marked as PUBLIC
- Verify RLS policies allow INSERT

### Local Development WebSocket Errors

**Error: WebSocket connection to `ws://localhost:5173` failed**
- Kill port 5173: `netstat -ano | findstr :5173` then `taskkill /PID <ID> /F`
- Restart dev server: `npm run dev`
- This is normal - HMR reconnects automatically

---

## post-Deployment Checklist

After deploying to Vercel, verify:

- [ ] Landing page loads at `https://your-domain`
- [ ] Navigation works (home, books, about, contact)
- [ ] Dark/light theme toggles
- [ ] Language selector works (5 languages)
- [ ] Subscribe form accepts email + country
- [ ] Subscribers appear in admin dashboard
- [ ] Admin access (5 logo clicks) works
- [ ] Book management page loads
- [ ] Analytics dashboard shows data
- [ ] Theme persists on refresh
- [ ] Mobile responsive on all screens
- [ ] PWA install button shows (on supported browsers)

---

## Environment Variables Reference

| Variable | Example | Source |
|----------|---------|--------|
| `VITE_SUPABASE_URL` | `https://bzdiixlpwfrmsztzzfsf.supabase.co` | Supabase → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` (long key) | Supabase → Settings → API |

## Performance Tips

1. **Cache Invalidation** - Vercel auto-busts CSS/JS cache with hash
2. **CDN** - All assets served via Vercel's global CDN
3. **Serverless** - No servers to manage, scales automatically
4. **Analytics** - View real-time traffic in Vercel dashboard

## Monitoring

Vercel provides free insights:
- Project → **Analytics** tab
- See real-time page load times
- Monitor visitor counts
- Check error rates

## Rollback to Previous Version

If a deployment breaks:
1. Go to Vercel dashboard → `Jenny` project
2. Click **Deployments** tab
3. Find previous successful deployment
4. Click **...** → **Promote to Production**

---

## Production URLs

- **Main App**: https://jenny-xxx.vercel.app
- **Admin Panel**: Click logo 5 times on landing page
- **GitHub Repo**: https://github.com/Stanleyakegbeotu/Jenny

## Support

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- React Router: https://reactrouter.com
- Vite: https://vitejs.dev

---

✅ **Your production app is now live and globally accessible!** 🚀
