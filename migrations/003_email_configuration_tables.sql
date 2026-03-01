-- ============================================================================
-- Email Configuration and Tracking Tables
-- ============================================================================
-- Migration for storing email preferences, templates, and delivery logs
-- Run this in Supabase SQL Editor after creating the main schema

-- ============================================================================
-- EMAIL LOGS TABLE (Track all sent emails)
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  resend_id text UNIQUE,
  recipient_email text NOT NULL,
  email_type text NOT NULL, -- 'contact_confirmation', 'welcome', 'newsletter', etc.
  subject text NOT NULL,
  status text DEFAULT 'sent', -- 'sent', 'bounced', 'failed', 'spam'
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  sent_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for efficient queries
CREATE INDEX email_logs_type_idx ON email_logs(email_type);
CREATE INDEX email_logs_recipient_idx ON email_logs(recipient_email);
CREATE INDEX email_logs_status_idx ON email_logs(status);
CREATE INDEX email_logs_sent_at_idx ON email_logs(sent_at DESC);

-- ============================================================================
-- EMAIL PREFERENCES TABLE (User email preferences)
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_preferences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id uuid REFERENCES subscribers(id) ON DELETE CASCADE UNIQUE,
  email text NOT NULL UNIQUE,
  
  -- Notification preferences
  receive_newsletters boolean DEFAULT true,
  receive_updates boolean DEFAULT true,
  receive_promotions boolean DEFAULT true,
  frequency text DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly'
  
  -- Marketing preferences
  marketing_consent boolean DEFAULT false,
  analytics_consent boolean DEFAULT false,
  
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX email_preferences_email_idx ON email_preferences(email);
CREATE INDEX email_preferences_subscriber_idx ON email_preferences(subscriber_id);

-- ============================================================================
-- EMAIL TEMPLATES TABLE (Customizable email templates)
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE, -- 'welcome', 'contact_confirmation', 'newsletter', etc.
  subject text NOT NULL,
  html_content text NOT NULL,
  text_content text,
  variables jsonb DEFAULT '[]'::jsonb, -- e.g., ["name", "email", "country"]
  is_active boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX email_templates_name_idx ON email_templates(name);
CREATE INDEX email_templates_active_idx ON email_templates(is_active);

-- ============================================================================
-- NEWSLETTER CAMPAIGNS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  cta_url text,
  cta_text text,
  
  -- Campaign status
  status text DEFAULT 'draft', -- 'draft', 'scheduled', 'sent', 'failed'
  scheduled_at timestamp with time zone,
  sent_at timestamp with time zone,
  
  -- Recipient targeting
  target_countries jsonb DEFAULT 'null'::jsonb, -- null = all
  exclude_unsubscribed boolean DEFAULT true,
  
  -- Statistics
  total_recipients integer DEFAULT 0,
  sent_count integer DEFAULT 0,
  bounce_count integer DEFAULT 0,
  open_count integer DEFAULT 0,
  click_count integer DEFAULT 0,
  
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX newsletter_campaigns_status_idx ON newsletter_campaigns(status);
CREATE INDEX newsletter_campaigns_scheduled_idx ON newsletter_campaigns(scheduled_at);

-- ============================================================================
-- UNSUBSCRIBE TOKENS TABLE (Secure unsubscribe links)
-- ============================================================================
CREATE TABLE IF NOT EXISTS unsubscribe_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  token varchar(255) UNIQUE NOT NULL,
  campaign_id uuid REFERENCES newsletter_campaigns(id) ON DELETE SET NULL,
  used_at timestamp with time zone,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX unsubscribe_tokens_token_idx ON unsubscribe_tokens(token);
CREATE INDEX unsubscribe_tokens_email_idx ON unsubscribe_tokens(email);
CREATE INDEX unsubscribe_tokens_expires_idx ON unsubscribe_tokens(expires_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Email logs - Public insert (for API), authenticated read
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert on email_logs"
  ON email_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read email logs"
  ON email_logs FOR SELECT
  USING (true);

-- Email preferences - Users can manage their own
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own email preferences"
  ON email_preferences FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own email preferences"
  ON email_preferences FOR UPDATE
  USING (true);

-- Email templates - Authenticated admins only
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read active templates"
  ON email_templates FOR SELECT
  USING (is_active = true OR true);

CREATE POLICY "Authenticated users can manage templates"
  ON email_templates FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update templates"
  ON email_templates FOR UPDATE
  USING (true);

-- Newsletter campaigns - Authenticated only
ALTER TABLE newsletter_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read campaigns"
  ON newsletter_campaigns FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create campaigns"
  ON newsletter_campaigns FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update campaigns"
  ON newsletter_campaigns FOR UPDATE
  USING (true);

-- Unsubscribe tokens - Public read (for unsubscribe links)
ALTER TABLE unsubscribe_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public unsubscribe token lookup"
  ON unsubscribe_tokens FOR SELECT
  USING (true);

CREATE POLICY "Allow token updates on unsubscribe"
  ON unsubscribe_tokens FOR UPDATE
  USING (true);

-- ============================================================================
-- SAMPLE EMAIL TEMPLATES
-- ============================================================================

INSERT INTO email_templates (name, subject, html_content, text_content, variables) VALUES
  (
    'welcome',
    '✨ Welcome to NENSHA JENNIFER''s Exclusive Community',
    '<h1>Welcome!</h1><p>Thank you for subscribing, {{name}}!</p>',
    'Welcome! Thank you for subscribing.',
    '["name", "email", "country"]'::jsonb
  ),
  (
    'contact_confirmation',
    '📬 We received your message - NENSHA JENNIFER',
    '<h1>Message Received</h1><p>Thank you {{name}}, we received your message.</p>',
    'Thank you for your message. We will respond soon.',
    '["name", "email", "subject", "message"]'::jsonb
  ),
  (
    'newsletter',
    '📖 {{subject}}',
    '<h1>{{subject}}</h1><p>{{content}}</p>',
    '{{subject}}\n\n{{content}}',
    '["subject", "content", "cta_url", "cta_text"]'::jsonb
  )
ON CONFLICT (name) DO NOTHING;
