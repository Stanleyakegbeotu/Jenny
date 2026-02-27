# NENSHA JENNIFER - Supabase Setup Guide

## ✅ Your Supabase Credentials (Updated in .env.local)

Your `.env.local` file has been updated with:
- **Project URL**: https://bzdiixlpwfrmsztzzfsf.supabase.co
- **Anon Key**: Configured and ready

---

## 📋 Step-by-Step Setup Instructions

### STEP 1: Create Database Tables

1. **Log in to your Supabase Dashboard**: https://supabase.com
2. Go to your project: `bzdiixlpwfrmsztzzfsf`
3. Navigate to **SQL Editor** (in the left sidebar)
4. Click **New Query**
5. **Copy and paste the entire SQL from `SUPABASE_SETUP.sql`** file in your project root
6. Click **Run** to execute all commands
7. Wait for success confirmation

**What this creates:**
- ✅ `books` - Store all books/stories
- ✅ `chapters` - Store chapters for each book
- ✅ `subscribers` - Email subscribers list
- ✅ `book_comments` - Comments and replies on books
- ✅ `book_interactions` - Likes, reads, clicks tracking
- ✅ `analytics_events` - Detailed analytics data
- ✅ `site_settings` - Configuration data (hero images, links, etc.)
- ✅ `contact_messages` - Contact form submissions

---

### STEP 2: Verify Tables and Data

1. Go to **Table Editor** (in the left sidebar)
2. You should see all 8 tables listed
3. Click on each table to verify it's empty (ready for data)

---

### STEP 3: Environment Variables (✅ Already Done)

Check your `.env.local` file contains:
```env
VITE_SUPABASE_URL=https://bzdiixlpwfrmsztzzfsf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....
```

---

### STEP 4: Real-Time Subscriptions Setup

These tables are configured for **real-time** updates (automatic sync):
- **book_comments** - Comments appear instantly for all users
- **book_interactions** - Likes/reads update in real-time
- **books** - Book data updates come through immediately

---

## 📊 Database Tables Overview

### **1. Books Table**
Stores all romance novels/stories
```
- id: UUID (primary key)
- title: The book title
- description: Book summary
- cover_url: Book cover image link
- author: Author name
- genre: Book genre
- status: draft | published | archived
- total_reads: Number of times read
- total_clicks: Number of external clicks
- total_likes: Number of likes
- comment_count: Total comments
- platform_links: Inkitt, Wattpad links (JSON)
- content: Full book content
- created_at: When book was created
- updated_at: Last update time
```

### **2. Chapters Table**
Stores individual chapters of books
```
- id: UUID
- book_id: Link to parent book
- chapter_number: Chapter sequence
- title: Chapter title
- content: Chapter text
- audio_url: TTS audio file link
- duration: Audio length in seconds
- created_at: Creation timestamp
```

### **3. Subscribers Table**
Email subscriber management
```
- id: UUID
- email: Subscriber email (unique)
- name: Subscriber name
- country: Country selected at signup
- subscribed_at: Signup timestamp
- is_active: Active subscription status
- notification_preferences: Email/push settings (JSON)
```

### **4. Book Comments Table**
Comments and nested replies
```
- id: UUID
- book_id: Which book being commented on
- author: Commenter name
- content: Comment text
- is_admin: Is admin comment?
- likes: Comment likes count
- parent_comment_id: Reply to which comment
- created_at: Comment timestamp
```

### **5. Book Interactions Table**
Tracks likes, reads, clicks
```
- id: UUID
- book_id: Which book
- user_id: Anonymous or user ID
- interaction_type: 'read' | 'click' | 'like' | 'comment'
- liked_at: When liked
- read_at: When read
- clicked_at: When clicked
- is_liked: Currently liked?
```

### **6. Analytics Events Table**
Detailed analytics tracking
```
- id: UUID
- event_type: 'book_view' | 'book_read' | 'subscriber_signup' | etc.
- book_id: Related book (if any)
- user_identifier: Anonymous ID or email
- country: User location
- device_info: Browser/OS info (JSON)
- timestamp: When event occurred
```

### **7. Site Settings Table**
Global configuration
```
- id: UUID
- setting_key: Setting name (unique)
- setting_value: Setting data (JSON)
- updated_at: Last modified
```

**Example entries:**
- `heroImage`: Hero section image URL
- `platformLinks`: External platform links
- `authorBio`: Author information
- `siteFeatures`: Feature flags

### **8. Contact Messages Table**
Contact form submissions
```
- id: UUID
- name: Visitor name
- email: Visitor email
- message: Message content
- status: unread | read | replied
- created_at: Submission time
```

---

## 🔄 Data Migration from localStorage to Supabase

The app currently saves data to **localStorage** (browser temporary storage). We're migrating to **Supabase** (permanent cloud storage).

### Currently Stored in localStorage:
1. **Books data** - Book details, reads, likes, clicks
2. **Comments** - Book comments and replies
3. **Subscribers** - Email list
4. **Site settings** - Hero images, platform links
5. **Analytics** - User interactions
6. **Badge count** - PWA notifications

### After Migration:
✅ All data will be stored in **Supabase cloud database**
✅ **Real-time sync** - Changes appear instantly across devices
✅ **Permanent storage** - Won't disappear on browser cache clear
✅ **Offline capability** - Works without internet, syncs when online
✅ **Analytics** - Track detailed user behavior patterns

---

## 🚀 Connecting Your App

The `supabaseClient.ts` will be updated to:

1. **Initialize Supabase** with your credentials ✅ (env vars set)
2. **Replace mock data** with real database calls
3. **Add real-time listeners** for comments and likes
4. **Update analytics** to log to database
5. **Persist all data** to Supabase

### Updated Functions Will Include:

**Books:**
- `fetchBooks()` - Get all published books from database
- `addBook()` - Create new book
- `updateBook()` - Modify book details
- `deleteBook()` - Remove book
- `trackBookRead()` - Log book read event
- `trackBookClick()` - Log external link click
- `likeBook()` - Add/remove like

**Comments:**
- `addBookComment()` - Post new comment with real-time sync
- `replyToComment()` - Reply to existing comment
- `likeComment()` - Like a comment
- Real-time listener subscription

**Subscribers:**
- `addSubscriber()` - Add email to list
- `fetchSubscribers()` - Get all subscribers
- `unsubscribe()` - Remove subscriber

**Analytics:**
- `trackEvent()` - Log analytics event
- `fetchAnalytics()` - Get analytics data
- `getTopBooks()` - Most read books

**Site Settings:**
- `saveSiteSettings()` - Store config
- `fetchSiteSettings()` - Get config

---

## ⚙️ What Happens Next

After you run the SQL schema:

1. I'll update `supabaseClient.ts` to use real Supabase instead of mock data
2. All functions will read/write to the database
3. Comments and likes will sync in real-time across all users
4. Analytics will track all interactions
5. localStorage will only be used for non-critical UI state (not data)

---

## 🔐 Security (Row-Level Security Enabled)

**Public can:**
- ✅ Read published books
- ✅ Read chapters
- ✅ Read comments
- ✅ Post comments
- ✅ Like books/comments
- ✅ Subscribe to newsletter
- ✅ Submit contact forms

**Admin only (you'll add authentication):**
- 🔒 Create/edit/delete books
- 🔒 View all subscriber data
- 🔒 View detailed analytics
- 🔒 Manage site settings

---

## 📝 Checklist

- [ ] Log in to Supabase dashboard
- [ ] Navigate to SQL Editor
- [ ] Copy SQL from `SUPABASE_SETUP.sql`
- [ ] Paste and run in SQL Editor
- [ ] Wait for success message
- [ ] Check Table Editor - all 8 tables should exist
- [ ] Confirm `.env.local` has credentials
- [ ] Run `npm run build` to test
- [ ] Let me know when tables are created!

---

## ❓ Next Steps

Once you've created the tables:
1. Tell me "Tables are created!"
2. I'll update all the database functions
3. Test the app with real Supabase data
4. Add authentication for admin features
5. Deploy to production!

---

## 🆘 Need Help?

If you encounter issues:
1. Check **Supabase Dashboard** > **Logs** for errors
2. Verify all tables appear in **Table Editor**
3. Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are in `.env.local`
4. Restart dev server: `npm run dev`

Let me know when the tables are ready! 🚀
