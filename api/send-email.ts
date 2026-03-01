/**
 * Email API Route
 * Handles email sending via Resend service
 * This is a serverless function deployed automatically by Vercel
 * 
 * Endpoint: POST /api/send-email
 */

// Type definitions for Vercel serverless function
type VercelResponse = any;
interface VercelRequest {
  method: string;
  body: any;
}

// Resend API configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@nenshasworld.com';

interface SendEmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if Resend API key is configured
  if (!RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY not configured');
    // In development, log the email but don't fail
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Email request (development mode):', req.body);
      return res.status(200).json({
        success: true,
        id: 'dev-' + Date.now(),
        message: 'Email logged (development mode)',
      });
    }
    return res.status(500).json({ error: 'Email service not configured' });
  }

  try {
    const { to, subject, html, text } = req.body as SendEmailRequest;

    // Validate required fields
    if (!to || !subject || !html) {
      return res.status(400).json({
        error: 'Missing required fields: to, subject, html',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({
        error: 'Invalid email address',
      });
    }

    console.log('📧 Sending email to:', to);

    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to,
        subject,
        html,
        text: text || stripHtmlTags(html),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Resend API error:', error);
      return res.status(response.status).json({
        error: 'Failed to send email',
        details: error,
      });
    }

    const data = await response.json();
    console.log('✅ Email sent successfully:', { to, id: data.id });

    return res.status(200).json({
      success: true,
      id: data.id,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('❌ Error in email API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Strip HTML tags from a string
 */
function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
}
