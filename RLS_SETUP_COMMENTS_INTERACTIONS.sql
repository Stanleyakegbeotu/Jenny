# RLS Policies for Comments and Interactions

Run this SQL in your Supabase SQL Editor to enable public commenting and book interactions:

## Commands to Run:

### 1. Enable RLS on book_comments table (if not already enabled)
```sql
ALTER TABLE book_comments ENABLE ROW LEVEL SECURITY;
```

### 2. Drop existing policies (if any)
```sql
DROP POLICY IF EXISTS "Allow public insert comments" ON book_comments;
DROP POLICY IF EXISTS "Allow public select comments" ON book_comments;
DROP POLICY IF EXISTS "Allow public update comments" ON book_comments;
```

### 3. Create public access policies for book_comments
```sql
CREATE POLICY "Allow public insert comments"
ON book_comments
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public select comments"
ON book_comments
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public update comments"
ON book_comments
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);
```

### 4. Enable RLS on book_interactions table (if not already enabled)
```sql
ALTER TABLE book_interactions ENABLE ROW LEVEL SECURITY;
```

### 5. Drop existing policies on book_interactions (if any)
```sql
DROP POLICY IF EXISTS "Allow public insert interactions" ON book_interactions;
DROP POLICY IF EXISTS "Allow public select interactions" ON book_interactions;
DROP POLICY IF EXISTS "Allow public update interactions" ON book_interactions;
```

### 6. Create public access policies for book_interactions
```sql
CREATE POLICY "Allow public insert interactions"
ON book_interactions
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public select interactions"
ON book_interactions
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public update interactions"
ON book_interactions
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);
```

## Steps:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy all the SQL above
6. Click the play ▶️ button

After running this SQL, comments and reactions will be saved properly!
