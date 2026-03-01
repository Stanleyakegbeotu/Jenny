# Formspree Contact Form Setup Guide

## Overview

The contact form now uses **Formspree** for simple, zero-backend email handling. All contact submissions are:
1. Saved to Supabase (for admin records)
2. Sent to your email via Formspree

## Quick Setup (5 minutes)

### Step 1: Create Formspree Account
1. Go to [formspree.io](https://formspree.io)
2. Sign up with your email
3. Create a new form (name it "Contact Form" or similar)

### Step 2: Copy Your Endpoint
1. After creating the form, copy the endpoint URL
2. It will look like: `https://formspree.io/f/xxxxx`

### Step 3: Configure in Admin Dashboard
1. Log in to your admin dashboard
2. Go to **Settings** → **Contact Form**
3. Paste your Formspree URL into the input field
4. Click **Save Settings**

### Step 4: Test It
1. Go to your site's contact section
2. Fill out and submit the form
3. You should receive an email from Formspree
4. The submission will also appear in your Supabase `contact_messages` table

## Features

✅ **Email Notifications** - You get emailed when someone submits the form
✅ **Admin Records** - All submissions saved in Supabase for record-keeping
✅ **No Backend Required** - Formspree handles email delivery
✅ **Easy Configuration** - Just paste your URL in admin settings
✅ **Analysis Tracking** - Contact submissions tracked in analytics

## File Structure

```
src/
├── lib/
│   ├── siteSettings.ts        # Settings management
│   └── supabaseClient.ts       # Supabase integration
├── app/components/
│   ├── landing/
│   │   └── ContactSection.tsx  # Contact form (uses Formspree)
│   └── admin/
│       ├── AdminSettings.tsx   # Settings UI component
│       └── SettingsPage.tsx    # Settings page with all tabs
migrations/
└── 004_settings_table.sql      # Database setup
```

## Database

The `site_settings` table stores your Formspree URL:

```sql
SELECT * FROM site_settings WHERE setting_key = 'formspree_contact_form_url';
```

## Troubleshooting

### Form Not Sending
- ✓ Verify Formspree URL is correct (starts with `https://formspree.io/`)
- ✓ Check that URL is saved in admin settings
- ✓ Try refreshing the page to load new URL

### Not Receiving Emails
- ✓ Check your Formspree dashboard for submissions
- ✓ Check spam/junk folder
- ✓ Verify email address in Formspree form settings

### Submissions in DB But No Email
- ✓ Check that Formspree URL is configured
- ✓ Visit Formspree dashboard to verify form is set up correctly
- ✓ Check Formspree documentation for email configuration

## Integration Details

### ContactSection.tsx
- Loads Formspree URL from `siteSettings.getFormspreeUrl()`
- Submits form data to both:
  1. Supabase (`saveContactMessage()`)
  2. Formspree endpoint
- Shows success/error messages to user

### AdminSettings Component
- Allows admin to input/update Formspree URL
- Validates URL format
- Saves to Supabase `site_settings` table
- Includes helpful setup instructions

### Removed Components
- ❌ Email service infrastructure (email.ts)
- ❌ Resend API endpoint (send-email.ts)
- ❌ EmailManagement component
- ✅ Now simplified to just Formspree

## Benefits Over Previous Setup

| Feature | Email Service | Formspree |
|---------|---------------|-----------|
| Setup Time | 30+ mins | 5 mins |
| Backend Required | Yes | No |
| Email Sending | Custom | Built-in |
| Configuration | Complex | Simple URL |
| Maintenance | High | Low |
| Cost | Possible | Free |

## Next Steps

1. Admin creates Formspree account
2. Admin pastes URL in dashboard settings
3. Contact form is live!

No environment variables, no API keys, no complex setup needed.
