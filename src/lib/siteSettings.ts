/**
 * Site Settings Manager
 * Handles reading and updating site configuration from Supabase
 */

import { supabase } from './supabaseClient';

export interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string | null;
  description: string | null;
  setting_type: string;
  updated_at: string;
  created_at: string;
}

export interface AuthorSettings {
  id?: string;
  name: string;
  bio: string;
  email: string;
  profileImage?: string;
  totalReads: number;
  booksPublished: number;
  followers: number;
  instagramUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
}

export interface NotificationSettings {
  id?: string;
  notifyNewSubscribers: boolean;
  notifyContactForm: boolean;
  notifyBookViews: boolean;
}

/**
 * Get a specific setting by key
 */
export async function getSetting(settingKey: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', settingKey)
      .single();

    if (error) {
      console.error(`Error fetching setting ${settingKey}:`, error);
      return null;
    }

    return data?.setting_value || null;
  } catch (err) {
    console.error(`Unexpected error fetching setting ${settingKey}:`, err);
    return null;
  }
}

/**
 * Get all settings
 */
export async function getAllSettings(): Promise<Record<string, string | null>> {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_key, setting_value');

    if (error) {
      console.error('Error fetching all settings:', error);
      return {};
    }

    const settings: Record<string, string | null> = {};
    data?.forEach((item) => {
      settings[item.setting_key] = item.setting_value;
    });

    return settings;
  } catch (err) {
    console.error('Unexpected error fetching all settings:', err);
    return {};
  }
}

/**
 * Update a specific setting
 */
export async function updateSetting(
  settingKey: string,
  settingValue: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('site_settings')
      .update({
        setting_value: settingValue,
        updated_at: new Date().toISOString(),
      })
      .eq('setting_key', settingKey);

    if (error) {
      console.error(`Error updating setting ${settingKey}:`, error);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`Unexpected error updating setting ${settingKey}:`, err);
    return false;
  }
}

/**
 * Get Formspree contact form URL
 */
export async function getFormspreeUrl(): Promise<string | null> {
  return getSetting('formspree_contact_form_url');
}

/**
 * Update Formspree contact form URL
 */
export async function updateFormspreeUrl(url: string): Promise<boolean> {
  // Validate URL format
  if (url && !url.startsWith('https://formspree.io/')) {
    console.warn('Invalid Formspree URL format. Should start with https://formspree.io/');
  }
  return updateSetting('formspree_contact_form_url', url);
}

// ============================================================================
// AUTHOR SETTINGS
// ============================================================================

/**
 * Get author settings from Supabase
 */
export async function getAuthorSettings(): Promise<AuthorSettings | null> {
  try {
    const { data, error } = await supabase
      .from('author_settings')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching author settings:', error);
      return null;
    }

    return {
      id: data?.id,
      name: data?.name || 'Jennifer Nensha',
      bio: data?.bio || '',
      email: data?.email || '',
      profileImage: data?.profile_image,
      totalReads: data?.total_reads || 0,
      booksPublished: data?.books_published || 0,
      followers: data?.followers || 0,
      instagramUrl: data?.instagram_url,
      twitterUrl: data?.twitter_url,
      linkedinUrl: data?.linkedin_url,
    };
  } catch (err) {
    console.error('Unexpected error fetching author settings:', err);
    return null;
  }
}

/**
 * Update author settings in Supabase
 */
export async function updateAuthorSettings(settings: AuthorSettings): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('author_settings')
      .update({
        name: settings.name,
        bio: settings.bio,
        email: settings.email,
        profile_image: settings.profileImage,
        total_reads: settings.totalReads,
        books_published: settings.booksPublished,
        followers: settings.followers,
        instagram_url: settings.instagramUrl,
        twitter_url: settings.twitterUrl,
        linkedin_url: settings.linkedinUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', settings.id || '00000000-0000-0000-0000-000000000000');

    if (error) {
      console.error('Error updating author settings:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error updating author settings:', err);
    return false;
  }
}

// ============================================================================
// NOTIFICATION SETTINGS
// ============================================================================

/**
 * Get notification settings from Supabase
 */
export async function getNotificationSettings(): Promise<NotificationSettings | null> {
  try {
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching notification settings:', error);
      return null;
    }

    return {
      id: data?.id,
      notifyNewSubscribers: data?.notify_new_subscribers ?? true,
      notifyContactForm: data?.notify_contact_form ?? true,
      notifyBookViews: data?.notify_book_views ?? false,
    };
  } catch (err) {
    console.error('Unexpected error fetching notification settings:', err);
    return null;
  }
}

/**
 * Update notification settings in Supabase
 */
export async function updateNotificationSettings(
  settings: NotificationSettings
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notification_settings')
      .update({
        notify_new_subscribers: settings.notifyNewSubscribers,
        notify_contact_form: settings.notifyContactForm,
        notify_book_views: settings.notifyBookViews,
        updated_at: new Date().toISOString(),
      })
      .eq('id', settings.id || '00000000-0000-0000-0000-000000000000');

    if (error) {
      console.error('Error updating notification settings:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error updating notification settings:', err);
    return false;
  }
}
