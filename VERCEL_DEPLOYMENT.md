# Vercel Deployment Guide

Deploy your Romance Author Platform to Vercel in minutes!

## Prerequisites

- GitHub account (already have it ✅)
- Vercel account (free at https://vercel.com)
- Your code pushed to GitHub (already done ✅)

## Step 1: Create Vercel Account

1. Go to https://vercel.com
2. Click **Sign Up**
3. Choose **Continue with GitHub**
4. Authorize Vercel to access your GitHub account

## Step 2: Import Project from GitHub

1. Go to https://vercel.com/dashboard
2. Click **Add New...** → **Project**
3. Find and select `Jenny` repository
4. Click **Import**

## Step 3: Configure Environment Variables

In the Vercel import screen, add your Supabase credentials:

**Environment Variables to Add:**

```
VITE_SUPABASE_URL=https://bzdiixlpwfrmsztzzfsf.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

⚠️ **Replace the values with your actual Supabase credentials from `.env.local`**

## Step 4: Deploy

1. Click **Deploy**
2. Wait 2-3 minutes for build to complete
3. You'll see a **Production** URL like: `https://jenny-xyz.vercel.app`

## Step 5: Configure Custom Domain (Optional)

1. Go to your Vercel project settings
2. Click **Domains**
3. Add your custom domain (e.g., `jenny.com`)
4. Follow DNS configuration steps

---

## Vercel Configuration File

I've created `vercel.json` with optimal settings for your Vite app.

## What Gets Deployed

✅ React + Vite frontend  
✅ All TypeScript components  
✅ Supabase integration  
✅ PWA manifest & service worker  
✅ i18n translations  
✅ TailwindCSS styling  

## GitHub Auto-Deployment

Every time you push to `main` branch on GitHub:
1. Vercel automatically detects changes
2. Builds your app
3. Deploys to production in 2-3 minutes

## Viewing Deployments

1. Go to your Vercel dashboard
2. Click `Jenny` project
3. See all deployments and their status

## Troubleshooting

### Build fails?
- Check environment variables are correctly set
- Ensure `.env.local` is in `.gitignore` (it is ✅)
- Clear Vercel cache: Project Settings → Deployments → Clear Cache

### Build succeeds but app doesn't work?
- Check Supabase URL and key are correct
- Verify Supabase project is accessible
- Open browser DevTools → Console for errors

### Slow deployment?
- Vercel caches builds when possible
- First deployment is slowest (30-60 seconds)
- Subsequent deploys usually 5-10 seconds

## Environment Variables Reference

| Variable | Value | Where to Find |
|----------|-------|---------------|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase project settings |
| `VITE_SUPABASE_ANON_KEY` | Your anon key | Supabase project settings → API |

## Post-Deployment

Once deployed to Vercel:

1. ✅ Database (Supabase) is live
2. ✅ Storage buckets work (book-covers, author-images, chapter-previews)
3. ✅ Analytics track automatically
4. ✅ PWA installable from deployment URL
5. ✅ All 5 languages work
6. ✅ Dark/light theme persists

## Rollback to Previous Version

If something breaks:
1. Go to Vercel dashboard
2. Click `Jenny` project
3. Find previous deployment
4. Click **...** → **Promote to Production**

## Monitoring

Vercel provides free analytics:
1. Project → **Analytics** tab
2. See real-time performance metrics
3. Monitor function performance

---

✅ Your app is now production-ready and deployed globally! 🚀
