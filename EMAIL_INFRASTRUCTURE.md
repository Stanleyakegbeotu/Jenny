# 📧 NENSHA JENNIFER Email Service - Complete Integration Guide

## Overview

This document outlines the complete, production-ready email service infrastructure for the NENSHA JENNIFER platform. The system handles:

- ✅ Contact form submissions with user confirmations
- ✅ Subscriber welcome emails
- ✅ Admin notifications
- ✅ Newsletter campaigns
- ✅ Unsubscribe management

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                   User Interface                              │
│         (React Components & Forms)                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              Frontend (src/lib/email.ts)                     │
│  • sendContactConfirmationEmail()                            │
│  • sendWelcomeEmail()                                        │
│  • sendNewsletterEmail()                                     │
│  • sendAdminNotifications()                                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│          Backend API (api/send-email.ts)                    │
│  • Validates email requests                                  │
│  • Handles Resend API integration                           │
│  • Logs email delivery                                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│           Resend Email Service                              │
│        (https://api.resend.com/emails)                      │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│          Email Provider Infrastructure                       │
│      • Gmail, Outlook, etc. (Recipients)                    │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Form Submission** → User submits contact/subscribe form
2. **Validation** → Data validated and saved to Supabase
3. **Email Trigger** → Confirmation email sent to user
4. **Admin Alert** → Admin email notification sent
5. **Logging** → Email delivery logged in database
6. **Delivery** → Email arrives in recipient inbox

## Installation & Setup

### 1. Install Dependencies

All dependencies are already included in your `package.json`:

```bash
npm install
```

### 2. Sign Up for Resend

Visit [https://resend.com](https://resend.com) and:
- Create free account
- Get API key (starts with `re_`)
- Verify domain (optional but recommended)

### 3. Configure Environment Variables

Copy template and add your Resend API key:

```bash
cp .env.email.example .env.local
```

Edit `.env.local`:

```env
# REQUIRED - Your Resend API key
VITE_RESEND_API_KEY=re_your_api_key_here

# REQUIRED - Admin email for notifications
VITE_ADMIN_EMAIL=your-admin-email@example.com

# OPTIONAL - Defaults provided
VITE_RESEND_FROM_EMAIL=noreply@nenshasworld.com
VITE_API_BASE_URL=http://localhost:3000
```

### 4. Database Setup (Optional)

For advanced features like email logs and campaign management:

```bash
# Copy and run the migration in Supabase SQL Editor
cat migrations/003_email_configuration_tables.sql
```

## File Structure

```
src/
├── lib/
│   ├── email.ts                 # Email service (client)
│   └── supabaseClient.ts        # Updated with email integration
│
├── app/components/
│   ├── landing/
│   │   ├── ContactSection.tsx   # Updated with email tracking
│   │   └── SubscribeSection.tsx # Updated with email tracking
│   │
│   └── admin/
│       └── EmailManagement.tsx  # Admin email dashboard (NEW)
│
api/
└── send-email.ts                # Email API endpoint (serverless)

migrations/
├── 001_initial_schema.sql
├── 002_fix_analytics_rls.sql
└── 003_email_configuration.sql  # Email tables (optional)

.env.local                        # Your environment config
.env.email.example               # Template with all options
EMAIL_SETUP_GUIDE.md            # Detailed setup guide
```

## API Endpoints

### POST `/api/send-email`

**Internal API endpoint for sending emails**

```bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d {
    "to": "user@example.com",
    "subject": "Hello!",
    "html": "<p>Email content</p>",
    "text": "Email content"
  }
```

**Response:**
```json
{
  "success": true,
  "id": "email_1234567890abcdef",
  "message": "Email sent successfully"
}
```

## Code Examples

### 1. Send Contact Confirmation Email

```typescript
import { sendContactConfirmationEmail } from '@/lib/email';

// Called automatically when form is submitted
await sendContactConfirmationEmail(
  'user@example.com',          // recipient
  'John Doe',                  // name
  'Website Inquiry',           // subject
  'I would like to know more...' // message
);
```

### 2. Send Newsletter

```typescript
import { sendNewsletterEmail } from '@/lib/email';

await sendNewsletterEmail(
  'subscriber@example.com',
  'New Book Release!',
  'Check out our latest book...',
  'https://nenshasworld.com/books',
  'Read Now'
);
```

### 3. Send to Multiple Subscribers

```typescript
import { fetchSubscribers } from '@/lib/supabaseClient';
import { sendNewsletterEmail } from '@/lib/email';

const subscribers = await fetchSubscribers();
const activeSubscribers = subscribers.filter(s => !s.unsubscribed_at);

for (const subscriber of activeSubscribers) {
  await sendNewsletterEmail(
    subscriber.email,
    'Subject',
    'Content...',
    'https://example.com',
    'Button Text'
  );
}
```

## Email Types

### 1. Contact Form Confirmation

**Triggered:** When contact form is submitted  
**Sent to:** Form submitter  
**Content:**
- Confirmation message
- Echo of submitted message
- Response time expectation

**Code:**
```typescript
sendContactConfirmationEmail(email, name, subject, message)
```

### 2. Welcome Email

**Triggered:** When new subscriber joins  
**Sent to:** Subscriber  
**Content:**
- Welcome message
- What to expect
- Call-to-action

**Code:**
```typescript
sendWelcomeEmail(email, country?)
```

### 3. Admin Notifications

**Triggered:** New contact/subscriber  
**Sent to:** Admin email  
**Content:** Full details from submission

**Code:**
```typescript
sendAdminContactNotification(name, email, subject, message)
sendAdminSubscriberNotification(email, country)
```

### 4. Newsletter Email

**Triggered:** Manual send or scheduled  
**Sent to:** Subscribers  
**Content:** Custom content + CTA

**Code:**
```typescript
sendNewsletterEmail(email, subject, content, ctaUrl?, ctaText?)
```

### 5. Unsubscribe Confirmation

**Triggered:** When user unsubscribes  
**Sent to:** Unsubscribing user  
**Content:** Confirmation they won't receive more emails

**Code:**
```typescript
sendUnsubscribeConfirmationEmail(email)
```

## Testing

### Local Testing

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Test contact form:**
   - Go to `/`
   - Scroll to "Contact" section
   - Fill out form
   - Click "Send Message"
   - Check console for logs
   - Check your email inbox

3. **Test subscription:**
   - Scroll to "Subscribe" section
   - Enter email and select country
   - Click "Subscribe"
   - Check email for welcome message

4. **Check console logs:**
   ```javascript
   // You should see:
   📧 Tracking event to database: ...
   📧 Sending contact confirmation email to: ...
   ✅ Email sent successfully: {id: "...", to: "..."}
   ```

### Email Service Testing (Resend)

1. **Test email delivery:**
   - Go to Resend Dashboard
   - Check "Overview" for sent emails
   - Verify delivery status

2. **Monitor failures:**
   - Resend Dashboard → Emails
   - Filter by status
   - Check bounce/failure reasons

## Admin Panel Features

### Email Management Dashboard

The new `EmailManagement` component provides:

- **Dashboard Tab:**
  - Total subscribers count
  - Active/inactive breakdown
  - Emails sent counter
  - Bounce rate tracking

- **Campaigns Tab:**
  - Create new newsletters
  - Send to all subscribers
  - Track campaign status
  - Edit/resend campaigns

- **Subscribers Tab:**
  - View all subscribers
  - Filter by country
  - Export as CSV
  - Manage preferences

- **Templates Tab:**
  - Customize email templates
  - Preview templates
  - Activate/deactivate

### Integration with Admin Dashboard

Add to your admin routing:

```typescript
import { EmailManagement } from '@/components/admin/EmailManagement';

// In your admin pages
<EmailManagement />
```

## Deployment (Vercel)

### 1. Add Environment Variables to Vercel

1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Add:

```
RESEND_API_KEY = re_your_key_here
RESEND_FROM_EMAIL = noreply@nenshasworld.com
```

4. Redeploy project

### 2. Verify Your Domain

For production sending:

1. Go to Resend Dashboard
2. Add domain (nenshasworld.com)
3. Add DNS records
4. Wait for verification

### 3. Update VITE_API_BASE_URL

For production, change in `.env.local` or Vercel:

```
VITE_API_BASE_URL = https://your-domain.com
```

## Performance & Best Practices

### Email Sending Performance

- ✅ **Async/non-blocking:** Emails sent asynchronously
- ✅ **Error handling:** Failures don't block user actions
- ✅ **Rate limiting:** Built-in request queuing
- ✅ **Logging:** All sends logged for tracking

### Best Practices

1. **Always validate emails before sending**
   ```typescript
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   if (!emailRegex.test(email)) return false;
   ```

2. **Handle failures gracefully**
   ```typescript
   try {
     await sendEmail(data);
   } catch (error) {
     // Log but don't break user flow
     console.error('Email failed:', error);
   }
   ```

3. **Use meaningful subject lines**
   ```typescript
   // ❌ Bad
   "Notification from NENSHA JENNIFER"
   
   // ✅ Good
   "📬 We received your message - NENSHA JENNIFER"
   ```

4. **Include unsubscribe links**
   - All emails include unsubscribe info
   - Compliant with anti-spam laws (CAN-SPAM, GDPR)

5. **Monitor deliverability**
   - Check Resend Dashboard regularly
   - Watch for high bounce rates
   - Update email lists proactively

## Troubleshooting

### Email Not Sending

**Check 1: API Key**
```bash
# Verify in .env.local
echo $VITE_RESEND_API_KEY
# Should output: re_xxxxxxxxx
```

**Check 2: Network**
```bash
# Test connectivity
curl -X GET https://api.resend.com/status
```

**Check 3: Logs**
```bash
# Check browser console (F12)
# Look for: "📧 Email sent successfully" or "❌ Error"
```

### Emails Going to Spam

**Solution 1: Verify Domain**
- Set up DKIM/SPF in Resend
- Reduce spam trigger words

**Solution 2: Improve Content**
- Use professional templates
- Avoid ALL CAPS
- Include unsubscribe link

### High Bounce Rate

**Common Causes:**
- Typos in email addresses
- Inactive/fake addresses
- Subscriber list not cleaned

**Solution:**
- Remove bounced emails from list
- Add validation on subscription
- Regular list hygiene

## Cost & Limits

### Free Plan (Resend)

- ✅ 100 emails/day
- ✅ Unlimited API calls
- ✅ Unlimited domains
- ✅ 24/7 support

### Upgrade Plans

- $20/mo - 1,000 emails/day
- $60/mo - 5,000 emails/day
- Custom plans available

See: [https://resend.com/pricing](https://resend.com/pricing)

## Support & Resources

### Documentation

- **Resend Docs:** [https://resend.com/docs](https://resend.com/docs)
- **Email Templates:** [https://react.email](https://react.email)
- **Setup Guide:** See `EMAIL_SETUP_GUIDE.md`

### Common Issues

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check API key in Resend Dashboard |
| No emails received | Check spam folder, verify email address |
| Slow delivery | Check Resend status page |
| Template looks wrong | Test in different email client |

## Next Steps

1. ✅ Get Resend API key
2. ✅ Add to `.env.local`
3. ✅ Test contact form
4. ✅ Test subscribe form
5. ✅ Deploy to production
6. ✅ Monitor emails in Resend Dashboard
7. ✅ Set up admin email notifications
8. ✅ Create newsletter campaigns

## Migration Checklist

- [ ] Set up Resend account
- [ ] Get API key
- [ ] Update `.env.local`
- [ ] Run `npm run dev`
- [ ] Test contact form
- [ ] Test subscribe form
- [ ] Verify emails arrive
- [ ] Add `.env.local` to `.gitignore` (security)
- [ ] Test on staging/production
- [ ] Monitor Resend Dashboard
- [ ] Set up admin notifications
- [ ] Document for team

---

**Last Updated:** March 2024  
**Status:** ✅ Production Ready
