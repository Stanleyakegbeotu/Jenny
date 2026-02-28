# Vercel Deployment Checklist

Use this checklist to deploy your app to Vercel in 5 minutes.

## ✅ Pre-Deployment Checklist

- [ ] GitHub repo created (https://github.com/Stanleyakegbeotu/Jenny)
- [ ] Code pushed to main branch
- [ ] `.gitignore` has `.env.local` (protects your secrets)
- [ ] `.env.example` exists with required variables
- [ ] `vercel.json` created with build config
- [ ] All tests pass locally: `npm run build`
- [ ] Supabase project set up with 8 database tables
- [ ] Supabase storage buckets created:
  - [ ] `author-images`
  - [ ] `book-covers`
  - [ ] `chapter-previews`

## 🚀 Deployment Steps

### 1. Create Vercel Account
- [ ] Go to https://vercel.com
- [ ] Sign up with GitHub
- [ ] Authorize Vercel access

### 2. Import GitHub Project
- [ ] In Vercel dashboard, click **Add New** → **Project**
- [ ] Search for `Jenny` repository
- [ ] Click **Import**

### 3. Configure Environment Variables
In the Vercel import dialog, add these variables:

```
VITE_SUPABASE_URL=https://bzdiixlpwfrmsztzzfsf.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
```

- [ ] Copy these from your `.env.local` file
- [ ] Add to Environment Variables section
- [ ] Click **Deploy**

### 4. Wait for Deployment
- [ ] Vercel starts building (takes 1-2 minutes)
- [ ] Watch build progress in console
- [ ] See **Production URL** when complete

### 5. Test Live App
- [ ] Open the production URL
- [ ] Check landing page loads
- [ ] Test book grid functionality
- [ ] Verify admin dashboard works
- [ ] Test language switching
- [ ] Try dark/light theme

## 📊 Post-Deployment Verification

- [ ] App loads without errors
- [ ] Supabase database connects (check browser console)
- [ ] Books/comments load from cloud database
- [ ] File uploads work (books Management)
- [ ] Analytics events tracked
- [ ] PWA installation works (if on HTTPS)
- [ ] All 5 languages functional:
  - [ ] English (EN)
  - [ ] Spanish (ES)
  - [ ] French (FR)
  - [ ] Portuguese (PT)
  - [ ] German (DE)

## 🔄 Continuous Deployment Setup

Vercel auto-deploys on every push to `main`:

```bash
git add .
git commit -m "Feature: description"
git push origin main
```

Check deployment status:
1. Go to your Vercel dashboard
2. Click `Jenny` project
3. See automatic deployment progress

## 🌐 Custom Domain (Optional)

To use your own domain instead of `vercel.app`:

1. Buy domain (GoDaddy, Namecheap, etc.)
2. In Vercel project → **Settings** → **Domains**
3. Add your domain
4. Update domain DNS to point to Vercel
5. Wait 24-48 hours for DNS propagation

## 🆘 Troubleshooting

**❌ Build fails**
- Check: Are all environment variables added?
- Check: Does `.gitignore` include `node_modules`?
- Redeploy: Vercel → Project → Deployments → Redeploy

**❌ App deploys but doesn't work**
- Check: Are Supabase credentials correct?
- Check: Is Supabase project active?
- Open DevTools → Console for error messages

**❌ Supabase connection fails**
- Verify: VITE_SUPABASE_URL is reachable
- Verify: VITE_SUPABASE_ANON_KEY is valid
- Check: Supabase RLS policies allow reads

## 📱 Testing After Deployment

**Desktop:**
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Mobile:**
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] PWA install on mobile

## 🎉 Success!

Your app is now live and accessible worldwide! 🚀

**Your production URL:** `https://jenny-xxx.vercel.app`

Every code change pushed to GitHub automatically deploys!
