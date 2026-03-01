# 📧 Email Service - Quick Setup & Testing Guide

## ⚡ Quick Start (5 Minutes)

### Step 1: Get Resend API Key (2 min)

1. Go to [https://resend.com](https://resend.com)
2. Click **"Get Started"** → Create account
3. Verify email
4. Go to **Settings** → **API Keys**
5. Click **"Create API Key"**
6. Copy the key (starts with `re_`)

### Step 2: Configure Environment (1 min)

Create `.env.local` file in project root:

```env
VITE_RESEND_API_KEY=re_paste_your_key_here
VITE_ADMIN_EMAIL=your.email@gmail.com
VITE_API_BASE_URL=http://localhost:3000
```

### Step 3: Start Development (1 min)

```bash
npm run dev
```

### Step 4: Test (1 min)

1. Go to http://localhost:5173 (or your dev URL)
2. Scroll to **Subscribe** section
3. Enter your email
4. Select country
5. Click **Subscribe**
6. **Check your inbox** for welcome email ✉️

---

## 📧 Full Email Features

### Contact Form Emails

**User gets:**
- ✅ Confirmation email
- ✅ "We received your message"
- ✅ Expected response time

**Admin gets:**
- 📧 Full contact details
- 📧 Message content
- 📧 Sender contact info

**How to test:**
1. Scroll to **Contact** section
2. Fill form with your details
3. Click **Send Message**
4. Check email for confirmation

### Subscriber Emails

**Subscriber gets:**
- 🎉 Welcome email
- 🎉 What to expect
- 🎉 Call to action

**Admin gets:**
- 📧 New subscriber alert
- 📧 Subscriber email + country
- 📧 Subscription timestamp

**How to test:**
1. Scroll to **Subscribe** section
2. Enter email + country
3. Click **Subscribe**
4. Check email for welcome

### Newsletter Feature

**Coming soon in admin panel:**
- 📨 Create and send newsletters
- 📨 Send to all subscribers
- 📨 Track delivery status
- 📨 Campaign analytics

---

## 🔧 Files Created/Modified

### New Files

| File | Purpose |
|------|---------|
| `src/lib/email.ts` | Email service functions |
| `api/send-email.ts` | Backend email API |
| `src/app/components/admin/EmailManagement.tsx` | Admin email dashboard |
| `migrations/003_email_configuration_tables.sql` | Database tables |
| `.env.email.example` | Environment template |
| `EMAIL_SETUP_GUIDE.md` | Detailed setup |
| `EMAIL_INFRASTRUCTURE.md` | Architecture doc |

### Modified Files

| File | Changes |
|------|---------|
| `src/lib/supabaseClient.ts` | Added email sending integration |
| `src/app/components/landing/ContactSection.tsx` | Integrated contact emails |
| `src/app/components/landing/SubscribeSection.tsx` | Integrated subscriber emails |

---

## 📊 Email Types Implemented

### 1. Contact Form Confirmation
```typescript
sendContactConfirmationEmail(email, name, subject, message)
```
- ✅ Sent to contact form submitter
- ✅ Professional HTML template
- ✅ Includes submitted message

### 2. Welcome Email
```typescript
sendWelcomeEmail(email, country)
```
- ✅ Sent to new subscriber
- ✅ Personalized with country
- ✅ Call-to-action to explore books

### 3. Admin Notifications
```typescript
sendAdminContactNotification(name, email, subject, message)
sendAdminSubscriberNotification(email, country)
```
- ✅ Alerts admin of new contacts
- ✅ Alerts admin of new subscribers
- ✅ Full details for quick response

### 4. Newsletter
```typescript
sendNewsletterEmail(email, subject, content, ctaUrl, ctaText)
```
- ✅ Send to specific subscribers
- ✅ Custom content
- ✅ Custom call-to-action

### 5. Unsubscribe Confirmation
```typescript
sendUnsubscribeConfirmationEmail(email)
```
- ✅ Sent when user unsubscribes
- ✅ Confirms they won't get more emails

---

## 🧪 Testing Checklist

### Local Testing

- [ ] **Subscribe Form**
  - [ ] Enter email
  - [ ] Select country
  - [ ] Click Subscribe
  - [ ] Check inbox for welcome email
  - [ ] Verify email content

- [ ] **Contact Form**
  - [ ] Enter name, email, message
  - [ ] Click Send Message
  - [ ] Check inbox for confirmation
  - [ ] Verify message echo in email

- [ ] **Browser Console**
  - [ ] Open DevTools (F12)
  - [ ] Go to Console tab
  - [ ] Look for 📧 email logs
  - [ ] Verify ✅ success messages

- [ ] **Admin Email**
  - [ ] Check admin inbox
  - [ ] Verify admin notification received
  - [ ] Check admin email in settings

### Console Output (Expected)

```javascript
// When you submit subscribe form:
📊 Analytics: subscribe_success {visitorId: "...", metadata: {...}}
📡 Tracking event to database: {eventType: 'subscribe_success', ...}
📧 Sending welcome email to: user@example.com
📧 Sending admin notification for new subscriber
✅ Email sent successfully: {id: "email_...", to: "user@example.com"}
```

---

## 🚀 Deployment to Production

### 1. Deploy Code
```bash
git add .
git commit -m "Add email service integration"
git push  # Triggers Vercel deployment
```

### 2. Add Vercel Environment Variables

1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Add:
   ```
   RESEND_API_KEY = re_your_key
   RESEND_FROM_EMAIL = noreply@nenshasworld.com
   ```
5. Redeploy

### 3. Update Production URL

Update `VITE_API_BASE_URL` to your production domain:

```env
VITE_API_BASE_URL=https://your-domain.com
```

### 4. Set Up Domain (Optional)

For better deliverability:

1. Go to Resend Dashboard
2. Add your domain
3. Follow DNS setup
4. Verify domain

---

## 📊 Monitoring & Analytics

### Check Email Status

1. Go to [Resend Dashboard](https://resend.com/emails)
2. See:
   - ✅ Sent emails count
   - 📬 Delivery status
   - ⚠️ Bounced emails
   - 📊 Open/click rates

### Browser Console Logs

Search for:
- ✅ "Email sent successfully"
- ❌ "Error sending email"
- 📧 "Tracking event to database"

### Database Queries

View email logs (if using optional tables):

```sql
SELECT * FROM email_logs 
ORDER BY sent_at DESC 
LIMIT 10;
```

---

## ❓ FAQ

### Q: Where do emails come from?
**A:** From `noreply@nenshasworld.com` (via Resend)

### Q: Why isn't my email arriving?
**A:** 
- Check spam folder
- Verify email address is correct
- Check Resend Dashboard for bounces
- Restart dev server

### Q: How do I change the sender email?
**A:** Update `.env.local`:
```env
VITE_RESEND_FROM_EMAIL=your.email@nenshasworld.com
```

### Q: Can I customize email templates?
**A:** Yes! Edit templates in `src/lib/email.ts`

### Q: Do I need to pay?
**A:** Free plan includes 100 emails/day. Check [Resend pricing](https://resend.com/pricing)

### Q: How do I send newsletters?
**A:** Coming soon in Admin Dashboard → Email Management

---

## 🔒 Security Notes

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Keep API key secret** - Only in environment variables
3. **Always validate emails** - Before sending
4. **Log sensitive data carefully** - Don't expose in production logs

---

## 📞 Support

### Resend Support
- Website: [https://resend.com](https://resend.com)
- Docs: [https://resend.com/docs](https://resend.com/docs)
- Status: [https://status.resend.com](https://status.resend.com)

### Your Setup Files
- Detailed guide: See `EMAIL_SETUP_GUIDE.md`
- Architecture: See `EMAIL_INFRASTRUCTURE.md`
- Code examples: See `src/lib/email.ts`

---

## ✅ What's Included

### Email Service Features
- ✅ Contact form confirmations
- ✅ Subscriber welcomes
- ✅ Admin notifications
- ✅ Newsletter sending
- ✅ Beautiful HTML templates
- ✅ Error handling
- ✅ Async/non-blocking
- ✅ Logging & monitoring

### Admin Features (Coming Soon)
- Dashboard with stats
- Campaign creator
- Subscriber management
- Template editor
- Email log viewer

### Production Ready
- ✅ Error handling
- ✅ Validation
- ✅ Rate limiting ready
- ✅ Secure environment config
- ✅ GDPR/CAN-SPAM compliant
- ✅ Mobile-friendly templates

---

## 🎯 Next Steps

1. **Right Now:** Get Resend API key (3 mins)
2. **Today:** Set up `.env.local` and test locally
3. **This Week:** Deploy to production
4. **Later:** Add newsletter feature to admin

---

**You're all set!** 🎉

Start testing by filling out the subscribe form. You should receive a welcome email within seconds.

Questions? Check `EMAIL_SETUP_GUIDE.md` for detailed troubleshooting.
