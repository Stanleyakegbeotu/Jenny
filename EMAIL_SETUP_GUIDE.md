# 📧 Email Service Setup Guide

Complete guide for setting up the email service with Resend for contact forms, subscriber notifications, and newsletters.

## Table of Contents
1. [Quick Start](#quick-start)
2. [Resend Setup](#resend-setup)
3. [Environment Configuration](#environment-configuration)
4. [Testing Emails](#testing-emails)
5. [Vercel Deployment](#vercel-deployment-setup)
6. [Email Types](#email-types)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. Sign Up for Resend
- Go to [https://resend.com](https://resend.com)
- Click "Get Started" and create a free account
- Verify your email address

### 2. Get Your API Key
- In Resend Dashboard, go to **API Keys**
- Click **"Create API Key"**
- Name it: `NENSHA_JENNIFER_PRODUCTION`
- Copy the key (it starts with `re_`)

### 3. Configure Environment Variables
Copy `.env.email.example` to `.env.local`:

```bash
cp .env.email.example .env.local
```

Edit `.env.local` and add your Resend API key:

```env
VITE_RESEND_API_KEY=re_your_api_key_here
VITE_ADMIN_EMAIL=your-email@example.com
VITE_API_BASE_URL=http://localhost:3000
```

### 4. Test Locally
```bash
npm run dev
```

Then:
1. Fill out the **Subscribe** form
2. Fill out the **Contact** form
3. Check your inbox for confirmation emails

---

## Resend Setup

### Step 1: Create Account at Resend

1. Visit [https://resend.com](https://resend.com)
2. Click **Get Started** (free plan available)
3. Sign up with email
4. Verify your email address
5. Log in to dashboard

### Step 2: Create API Key

1. Go to **Settings** → **API Keys**
2. Click **"Create API Key"**
3. Enter name: `NENSHA JENNIFER`
4. Select region: **Global**
5. Copy the generated key (starts with `re_`)

### Step 3: Verify Sender Domain (Optional but Recommended)

**For Production:**
1. Go to **Domains** in Resend Dashboard
2. Click **"Add Domain"**
3. Enter your domain: `nenshasworld.com`
4. Add the provided DNS records to your domain registrar
5. Click **"Verify"** once DNS is updated

**For Development:**
- Use Resend's default domain: `onboarding@resend.dev` (for testing)
- Or use: `noreply@nenshasworld.com` (requires domain verification)

### Step 4: Monitor Email Usage

1. Go to **Overview** in Resend Dashboard
2. Track sent emails, bounces, and spam complaints
3. Set up email reminders for quota limits

---

## Environment Configuration

### `.env.local` Setup

```bash
# Required
VITE_RESEND_API_KEY=re_your_key_here
VITE_ADMIN_EMAIL=your-admin-email@gmail.com

# Optional (defaults provided)
VITE_RESEND_FROM_EMAIL=noreply@nenshasworld.com
VITE_API_BASE_URL=http://localhost:3000
VITE_EMAIL_FROM_NAME=NENSHA JENNIFER
```

### For Vercel Deployment

Add to Vercel Environment Variables:

1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add each variable from above
4. Redeploy your project

---

## Testing Emails

### Local Development Testing

#### Test Contact Form
1. Navigate to [http://localhost:3000](http://localhost:3000)
2. Scroll to **Contact** section
3. Fill out form:
   - Name: `Test User`
   - Email: `your-test-email@gmail.com`
   - Message: `This is a test message`
4. Click **Send Message**
5. Check email for confirmation

**Emails You Should Receive:**
- ✉️ **Confirmation Email** (to sender) - "We received your message"
- 📧 **Admin Notification** (to admin email) - "New Contact Form Submission"

#### Test Subscribe Form
1. Scroll to **Subscribe** section
2. Fill out form:
   - Email: `your-test-email@gmail.com`
   - Country: Select from dropdown
3. Click **Subscribe**
4. Check email for welcome message

**Emails You Should Receive:**
- ✉️ **Welcome Email** (to subscriber)
- 📧 **Admin Notification** (to admin) - New subscriber alert

### Console Logging

Open Browser DevTools (F12) → Console tab and look for:

```javascript
📧 Tracking event to database: {eventType: 'subscribe_success', ...}
📧 Email request sent to backend
✅ Email sent successfully: {id: "...", to: "..."}
```

### Server Logs (Backend)

When running your development server, check logs for:

```
📧 Sending welcome email to: user@example.com
📧 Sending admin notification for new subscriber
✅ Email sent successfully: {to: 'user@example.com', id: 'email_1234...'}
```

---

## Vercel Deployment Setup

### 1. Add API Route

The email API is already in `/api/send-email.ts`. Vercel automatically creates serverless functions from this directory.

### 2. Add Environment Variables to Vercel

1. Go to **Vercel Dashboard**
2. Select **Settings** → **Environment Variables**
3. Add these variables:

```
RESEND_API_KEY = re_your_key_here
RESEND_FROM_EMAIL = noreply@nenshasworld.com
```

### 3. Update `VITE_API_BASE_URL` in `.env.local`

For production, update to your domain:

```env
VITE_API_BASE_URL=https://your-domain.com
```

Or add to Vercel environment variables:

```
VITE_API_BASE_URL = https://your-domain.com
```

### 4. Redeploy

```bash
git add .
git commit -m "Add email service configuration"
git push  # This triggers Vercel deployment
```

### 5. Test on Production

1. Go to your live domain
2. Fill out contact/subscribe forms
3. Verify emails arrive
4. Check Resend Dashboard for delivery status

---

## Email Types

### 1. Contact Form Confirmation Email
**Sent to:** Contact form submitter  
**Trigger:** After successful form submission  
**Contents:**
- Confirmation that message was received
- Echo of submitted message
- Expected response time
- Contact information

**Template:** `generateContactConfirmationEmail()` in `src/lib/email.ts`

### 2. Welcome Email (New Subscriber)
**Sent to:** New email subscriber  
**Trigger:** After successful subscription  
**Contents:**
- Welcome message
- What to expect (updates, offers, etc.)
- Link to website
- Country personalization (optional)

**Template:** `generateWelcomeEmail()` in `src/lib/email.ts`

### 3. Admin Contact Notification
**Sent to:** Admin email address  
**Trigger:** New contact form submission  
**Contents:**
- Sender name, email, message
- Subject and full message body
- Quick action buttons
- Link to admin dashboard

**Template:** `generateAdminContactNotificationEmail()` in `src/lib/email.ts`

### 4. Admin New Subscriber Notification
**Sent to:** Admin email address  
**Trigger:** New subscriber signup  
**Contents:**
- New subscriber email
- Country of subscriber
- Timestamp
- Link to admin dashboard

**Template:** `generateAdminSubscriberNotificationEmail()` in `src/lib/email.ts`

### 5. Unsubscribe Confirmation
**Sent to:** Unsubscribing user  
**Trigger:** After clicking unsubscribe or unsubscribe action  
**Contents:**
- Confirmation of unsubscribe
- Message that they won't receive more emails
- Resubscription information

**Template:** `generateUnsubscribeConfirmationEmail()` in `src/lib/email.ts`

### 6. Newsletter Email (Custom)
**Sent to:** Specific subscribers  
**Trigger:** Manual send via admin dashboard  
**Contents:**
- Custom subject and content
- Call-to-action button (optional)

**Template:** `generateNewsletterEmail()` in `src/lib/email.ts`

---

## Troubleshooting

### Problem: "Email service not configured" Error

**Solution:**
- Check that `VITE_RESEND_API_KEY` is set in `.env.local`
- Verify API key is valid (starts with `re_`)
- Restart dev server after updating `.env.local`

### Problem: Emails Not Arriving

**Solution:**
1. Check Resend Dashboard for bounces/failures
2. Verify recipient email address is correct
3. Check spam/junk folder
4. Verify sender domain is authorized

### Problem: "Invalid email address" Error

**Solution:**
- Ensure email format is correct: `user@domain.com`
- Check for extra spaces or special characters
- Verify email field is not empty

### Problem: Blank Emails or Missing Content

**Solution:**
- Check HTML template generation in `src/lib/email.ts`
- Verify metadata is passed correctly (names, subjects, etc.)
- Test with simple message first

### Problem: Admin Emails Not Received

**Solution:**
1. Verify `VITE_ADMIN_EMAIL` is set correctly
2. Check spam folder
3. Add sender to contacts to prevent filtering
4. Check logs for errors: `console.log('📧 Sending admin notification')`

### Problem: Emails Arriving Late

**Solution:**
- Resend usually sends within seconds
- Check browser console for API response time
- Verify Resend API status at [https://status.resend.com](https://status.resend.com)

### Problem: 401 Unauthorized Error

**Solution:**
- API key is invalid or expired
- Generate new API key in Resend Dashboard
- Update `.env.local` and restart server

### Enable Debug Logging

Add to `.env.local`:

```
VITE_DEBUG_EMAIL=true
```

This will log full email details in console.

---

## Custom Email Sending

### Send Newsletter to All Subscribers

Add this function to `src/lib/email.ts`:

```typescript
export async function sendNewsletterToAll(
  subject: string,
  content: string,
  ctaUrl?: string
): Promise<void> {
  try {
    const subscribers = await fetchSubscribers();
    const activeSubscribers = subscribers.filter(s => !s.unsubscribed_at);
    
    for (const subscriber of activeSubscribers) {
      await sendNewsletterEmail(
        subscriber.email,
        subject,
        content,
        ctaUrl,
        'Read More'
      );
    }
    
    console.log(`📧 Newsletter sent to ${activeSubscribers.length} subscribers`);
  } catch (error) {
    console.error('Error sending newsletter:', error);
  }
}
```

### Send Custom Email

```typescript
import { sendEmail } from '../lib/email';

await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<p>Custom HTML content</p>',
  text: 'Plain text fallback'
});
```

---

## Security Best Practices

1. **Never expose API key:** Keep `VITE_RESEND_API_KEY` in `.env.local`, never commit to Git
2. **Validate emails:** Always validate email format before sending
3. **Rate limiting:** Add rate limiting for form submissions
4. **CORS:** Configure CORS in your backend to allow only your domain
5. **Admin email:** Protect admin email address, don't share publicly

---

## Pricing

**Resend Free Plan:**
- ✅ 100 emails/day
- ✅ Unlimited domains
- ✅ Unlimited API calls
- ✅ 24/7 email support

**Paid Plans:**
- $20/mo - 1,000 emails/day
- Pay-as-you-go available

Check [https://resend.com/pricing](https://resend.com/pricing) for details.

---

## Support

- **Resend Documentation:** [https://resend.com/docs](https://resend.com/docs)
- **Email Templates:** [https://react.email](https://react.email)
- **Status Page:** [https://status.resend.com](https://status.resend.com)

---

Last updated: March 2024
