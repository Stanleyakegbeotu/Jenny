# Supabase Storage Setup Guide

Your app uses Supabase Storage to upload and store:
- Author profile images
- Book cover images
- Chapter preview images

*(Audio is handled by TTS, no upload needed)*

## Step 1: Create Storage Buckets

Go to your Supabase Dashboard → **Storage** → Click **Create a new bucket**

Create **3 buckets** with these names:

### 1️⃣ `author-images`
- **Name**: `author-images`
- **Public bucket**: ✅ Yes (for author profiles)
- Click **Create bucket**

### 2️⃣ `book-covers`
- **Name**: `book-covers`
- **Public bucket**: ✅ Yes (so covers display publicly)
- Click **Create bucket**

### 3️⃣ `chapter-previews`
- **Name**: `chapter-previews`
- **Public bucket**: ✅ Yes
- Click **Create bucket**

## Step 2: Set Upload Policies (Optional but Recommended)

For each bucket, click on it → **Access Control** tab

**For public uploads, use this RLS policy:**

```sql
-- Run in SQL Editor for each bucket

-- For author-images
create policy "public_upload_authors" on storage.objects
for insert with check (bucket_id = 'author-images');

-- For book-covers
create policy "public_upload_covers" on storage.objects
for insert with check (bucket_id = 'book-covers');

-- For chapter-previews
create policy "public_upload_previews" on storage.objects
for insert with check (bucket_id = 'chapter-previews');
```

## Step 3: Test Upload

Once buckets are created, you can test file uploads from the admin dashboard:
1. Go to http://localhost:5173/admin
2. Try uploading a book cover image
3. It should save to Supabase Storage automatically

## Bucket Structure (Optional)

You can organize uploads like this in each bucket:

```
author-images/
├── author-1-1708976400000.jpg
├── author-2-1708976450000.png
└── ...

book-covers/
├── book-1-1708976400000.jpg
├── book-2-1708976450000.png
└── ...

chapter-previews/
├── chapter-1-1708976600000.jpg
├── chapter-2-1708976650000.jpg
└── ...
```

Files are auto-named: `{author-or-book-or-chapter-id}-{timestamp}.{ext}`

## What the App Does

When you upload files via the admin dashboard:
1. File is sent to Supabase Storage
2. Public URL is returned
3. URL is saved in the database (books/chapters table)
4. Images/audio load automatically on the front-end

## Troubleshooting

**Upload fails?**
- Check bucket names are exact: `author-images`, `book-covers`, `chapter-previews`
- Ensure buckets are marked as PUBLIC
- Check .env.local has correct Supabase URL and API key

**Files don't appear?**
- Refresh the page
- Check Network tab to see if upload succeeded
- Verify files exist in Storage → bucket → Files tab

**Want to delete old uploads?**
- Go to Supabase Dashboard → Storage → bucket name
- Click files to delete them
- Or use the API: `supabase.storage.from('bucket-name').remove(['file-name'])`

---

✅ Once you create these 3 buckets, your app is fully configured! All uploads work automatically (author images, book covers, previews). Audio is handled by TTS.
