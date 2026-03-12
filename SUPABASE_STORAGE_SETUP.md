# Supabase Storage Setup Guide

Your app uses Supabase Storage to upload and store:
- Author profile images
- Hero images
- Book cover images
- Chapter preview images

## Step 1: Create Storage Buckets

Go to your Supabase Dashboard ? **Storage** ? Click **Create a new bucket**

Create **4 buckets** with these names:

### 1 `author-images`
- Public bucket: Yes

### 2 `hero-images`
- Public bucket: Yes

### 3 `book-covers`
- Public bucket: Yes

### 4 `chapter-previews`
- Public bucket: Yes


## Step 2: Set Upload Policies (Required for Uploads)

Use the SQL in `SUPABASE_STORAGE_POLICIES.sql` (recommended) or run the policies manually in Supabase SQL Editor.  
These policies allow `INSERT` and `UPDATE` (for upsert) on each bucket.

## Step 3: Test Upload

1. Go to `http://localhost:5173/admin`
2. Upload a book cover image or hero image
3. Confirm it appears in Supabase Storage

## Bucket Structure (Optional)

Files are auto-named by the app:

```
author-images/
+-- author-<timestamp>.jpg

hero-images/
+-- hero-<timestamp>.jpg

book-covers/
+-- <book-id>-<timestamp>.jpg

chapter-previews/
+-- <chapter-id>-<timestamp>.jpg
```

## Troubleshooting

- Bucket names must match exactly
- Buckets must be public if you want public image URLs
- Ensure `.env.local` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
