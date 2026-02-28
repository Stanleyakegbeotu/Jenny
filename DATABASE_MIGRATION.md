# Database Migration: Add Book Link Columns

## What to do:

1. Go to your Supabase Dashboard
2. Click on **SQL Editor** in the left sidebar
3. Create a new query
4. Copy and paste the SQL below
5. Click the play button to execute

## SQL to Run:

```sql
-- Add book_link and book_platform columns to books table
ALTER TABLE books ADD COLUMN book_link TEXT;
ALTER TABLE books ADD COLUMN book_platform TEXT;
```

## What this does:

- **book_link**: Stores the URL where readers can find the full book
- **book_platform**: Stores the platform name (e.g., "Inkitt", "Wattpad", "Amazon")

After running this SQL, your app will be able to update books with the new book link and platform information.
