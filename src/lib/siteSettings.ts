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
  subscribers: number; // Changed from followers
  instagramUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  reviews?: any[];
}

export interface NotificationSettings {
  id?: string;
  notifyNewSubscribers: boolean;
  notifyContactForm: boolean;
  notifyBookViews: boolean;
}

export interface HeroSettings {
  id?: string;
  heroImage?: string;
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
    console.log('⚙️ [getAuthorSettings] Fetching author settings from Supabase...');
    const { data, error, status } = await supabase
      .from('author_settings')
      .select('*')
      .eq('is_default', true)
      .single();

    console.log('⚙️ [getAuthorSettings] Response status:', status);
    console.log('⚙️ [getAuthorSettings] Response error:', error);
    console.log('⚙️ [getAuthorSettings] Data retrieved:', !!data);

    if (error) {
      console.error('❌ [getAuthorSettings] Query failed:', error);
      // If no row exists, create one with defaults
      if (error.code === 'PGRST116') {
        console.log('📝 [getAuthorSettings] No author settings found, creating default row...');
        const insertResult = await supabase
          .from('author_settings')
          .insert({
            name: 'Jennifer Nensha',
            bio: 'Romance author crafting tales of love and passion.',
            email: 'contact@jennifernens.com',
            total_reads: 0,
            books_published: 0,
            followers: 0,
          })
          .select()
          .single();

        if (insertResult.error) {
          console.error('❌ [getAuthorSettings] Failed to create default:', insertResult.error);
          return null;
        }

        console.log('✅ [getAuthorSettings] Default settings created with ID:', insertResult.data?.id);
        return {
          id: insertResult.data?.id,
          name: insertResult.data?.name || 'Jennifer Nensha',
          bio: insertResult.data?.bio || '',
          email: insertResult.data?.email || '',
          profileImage: insertResult.data?.profile_image,
          totalReads: insertResult.data?.total_reads || 0,
          booksPublished: insertResult.data?.books_published || 0,
          subscribers: insertResult.data?.followers || 0,
          instagramUrl: insertResult.data?.instagram_url,
          twitterUrl: insertResult.data?.twitter_url,
          linkedinUrl: insertResult.data?.linkedin_url,
          reviews: insertResult.data?.reviews || [],
        };
      }
      return null;
    }

    console.log('✅ [getAuthorSettings] Settings loaded successfully');
    return {
      id: data?.id,
      name: data?.name || 'Jennifer Nensha',
      bio: data?.bio || '',
      email: data?.email || '',
      profileImage: data?.profile_image,
      totalReads: data?.total_reads || 0,
      booksPublished: data?.books_published || 0,
      subscribers: data?.followers || 0,
      instagramUrl: data?.instagram_url,
      twitterUrl: data?.twitter_url,
      linkedinUrl: data?.linkedin_url,
      reviews: data?.reviews || [],
    };
  } catch (err) {
    console.error('❌ [getAuthorSettings] Unexpected error:', err);
    return null;
  }
}

/**
 * Update author settings in Supabase
 */
export async function updateAuthorSettings(settings: AuthorSettings): Promise<boolean> {
  try {
    if (!settings.id) {
      console.error('Cannot update author settings: ID is missing');
      return false;
    }

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
        reviews: settings.reviews || [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', settings.id);

    if (error) {
      console.error('Error updating author settings:', error);
      return false;
    }

    console.log('✅ Author settings updated successfully');
    return true;
  } catch (err) {
    console.error('Unexpected error updating author settings:', err);
    return false;
  }
}

/**
 * Upsert author settings (insert if missing, update if exists)
 */
export async function upsertAuthorSettings(settings: AuthorSettings): Promise<boolean> {
  try {
    console.log('⚙️ [upsertAuthorSettings] Upserting author settings:', settings.name);
    const payload: any = {
      id: settings.id,
      name: settings.name,
      bio: settings.bio,
      email: settings.email,
      profile_image: settings.profileImage,
      total_reads: settings.totalReads,
      books_published: settings.booksPublished,
      followers: settings.subscribers,
      instagram_url: settings.instagramUrl,
      twitter_url: settings.twitterUrl,
      linkedin_url: settings.linkedinUrl,
      reviews: settings.reviews || [],
      is_default: true,
      updated_at: new Date().toISOString(),
    };

    console.log('⚙️ [upsertAuthorSettings] Payload:', payload);

    // First, try to get existing record
    const { data: existing, error: selectError } = await supabase
      .from('author_settings')
      .select('id')
      .eq('is_default', true)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('❌ [upsertAuthorSettings] Error checking for existing record:', selectError);
      return false;
    }

    let result;

    if (existing && existing.id) {
      // Update existing record
      console.log('📝 [upsertAuthorSettings] Updating existing record:', existing.id);
      result = await supabase
        .from('author_settings')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      // Insert new record
      console.log('➕ [upsertAuthorSettings] Creating new record');
      result = await supabase
        .from('author_settings')
        .insert([payload])
        .select()
        .single();
    }

    const { data, error, status } = result;

    console.log('⚙️ [upsertAuthorSettings] Response status:', status);
    console.log('⚙️ [upsertAuthorSettings] Response error:', error);

    if (error) {
      console.error('❌ [upsertAuthorSettings] Operation failed:', error);
      return false;
    }

    console.log('✅ [upsertAuthorSettings] Success! ID:', data?.id);
    return true;
  } catch (err) {
    console.error('❌ [upsertAuthorSettings] Unexpected error:', err);
    const errorMsg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('❌ [upsertAuthorSettings] Error details:', errorMsg);
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
      .eq('is_default', true)
      .single();

    if (error) {
      console.error('Error fetching notification settings:', error);
      // If no row exists, create one with defaults
      if (error.code === 'PGRST116') {
        console.log('No notification settings found, creating default row...');
        const insertResult = await supabase
          .from('notification_settings')
          .insert({
            notify_new_subscribers: true,
            notify_contact_form: true,
            notify_book_views: false,
          })
          .select()
          .single();

        if (insertResult.error) {
          console.error('Failed to create default notification settings:', insertResult.error);
          return null;
        }

        return {
          id: insertResult.data?.id,
          notifyNewSubscribers: insertResult.data?.notify_new_subscribers ?? true,
          notifyContactForm: insertResult.data?.notify_contact_form ?? true,
          notifyBookViews: insertResult.data?.notify_book_views ?? false,
        };
      }
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
    if (!settings.id) {
      console.error('Cannot update notification settings: ID is missing');
      return false;
    }

    const { error } = await supabase
      .from('notification_settings')
      .update({
        notify_new_subscribers: settings.notifyNewSubscribers,
        notify_contact_form: settings.notifyContactForm,
        notify_book_views: settings.notifyBookViews,
        updated_at: new Date().toISOString(),
      })
      .eq('id', settings.id);

    if (error) {
      console.error('Error updating notification settings:', error);
      return false;
    }

    console.log('✅ Notification settings updated successfully');
    return true;
  } catch (err) {
    console.error('Unexpected error updating notification settings:', err);
    return false;
  }
}

/**
 * Upsert notification settings (insert if missing, update if exists)
 */
export async function upsertNotificationSettings(settings: NotificationSettings): Promise<boolean> {
  try {
    console.log('🔔 [upsertNotificationSettings] Upserting notification settings');
    const payload: any = {
      id: settings.id,
      notify_new_subscribers: settings.notifyNewSubscribers,
      notify_contact_form: settings.notifyContactForm,
      notify_book_views: settings.notifyBookViews,
      is_default: true,
      updated_at: new Date().toISOString(),
    };

    // First, try to get existing record
    const { data: existing, error: selectError } = await supabase
      .from('notification_settings')
      .select('id')
      .eq('is_default', true)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('❌ [upsertNotificationSettings] Error checking for existing record:', selectError);
      return false;
    }

    let result;

    if (existing && existing.id) {
      // Update existing record
      console.log('📝 [upsertNotificationSettings] Updating existing record:', existing.id);
      result = await supabase
        .from('notification_settings')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      // Insert new record
      console.log('➕ [upsertNotificationSettings] Creating new record');
      result = await supabase
        .from('notification_settings')
        .insert([payload])
        .select()
        .single();
    }

    const { data, error } = result;

    if (error) {
      console.error('❌ [upsertNotificationSettings] Operation failed:', error);
      return false;
    }

    console.log('✅ [upsertNotificationSettings] Success! ID:', data?.id);
    return true;
  } catch (err) {
    console.error('❌ [upsertNotificationSettings] Unexpected error:', err);
    const errorMsg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('❌ [upsertNotificationSettings] Error details:', errorMsg);
    return false;
  }
}

// ============================================================================
// HERO SETTINGS
// ============================================================================

/**
 * Get hero settings from Supabase
 */
export async function getHeroSettings(): Promise<HeroSettings | null> {
  try {
    console.log('🚀 [getHeroSettings] Fetching hero settings from Supabase...');
    const { data, error, status } = await supabase
      .from('hero_settings')
      .select('*')
      .eq('is_default', true)
      .single();

    console.log('🚀 [getHeroSettings] Response status:', status);
    console.log('🚀 [getHeroSettings] Response error:', error);

    if (error) {
      console.error('❌ [getHeroSettings] Query failed:', error);
      // If no row exists, create one with defaults
      if (error.code === 'PGRST116') {
        console.log('📝 [getHeroSettings] No hero settings found, creating default row...');
        const insertResult = await supabase
          .from('hero_settings')
          .insert({
            hero_image: '',
          })
          .select()
          .single();

        if (insertResult.error) {
          console.error('❌ [getHeroSettings] Failed to create default:', insertResult.error);
          return null;
        }

        console.log('✅ [getHeroSettings] Default settings created with ID:', insertResult.data?.id);
        return {
          id: insertResult.data?.id,
          heroImage: insertResult.data?.hero_image,
        };
      }
      return null;
    }

    console.log('✅ [getHeroSettings] Settings loaded successfully');
    return {
      id: data?.id,
      heroImage: data?.hero_image,
    };
  } catch (err) {
    console.error('❌ [getHeroSettings] Unexpected error:', err);
    return null;
  }
}

/**
 * Upsert hero settings (insert if missing, update if exists)
 */
export async function upsertHeroSettings(settings: HeroSettings): Promise<boolean> {
  try {
    console.log('🚀 [upsertHeroSettings] Upserting hero settings');
    const payload: any = {
      id: settings.id,
      hero_image: settings.heroImage || '',
      is_default: true,
      updated_at: new Date().toISOString(),
    };

    console.log('🚀 [upsertHeroSettings] Payload size:', JSON.stringify(payload).length, 'bytes');

    // First, try to get existing record
    const { data: existing, error: selectError } = await supabase
      .from('hero_settings')
      .select('id')
      .eq('is_default', true)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('❌ [upsertHeroSettings] Error checking for existing record:', selectError);
      return false;
    }

    let result;

    if (existing && existing.id) {
      // Update existing record
      console.log('📝 [upsertHeroSettings] Updating existing record:', existing.id);
      result = await supabase
        .from('hero_settings')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      // Insert new record
      console.log('➕ [upsertHeroSettings] Creating new record');
      result = await supabase
        .from('hero_settings')
        .insert([payload])
        .select()
        .single();
    }

    const { data, error, status } = result;

    console.log('🚀 [upsertHeroSettings] Response status:', status);
    console.log('🚀 [upsertHeroSettings] Response error:', error);

    if (error) {
      console.error('❌ [upsertHeroSettings] Operation failed:', error);
      return false;
    }

    console.log('✅ [upsertHeroSettings] Success! ID:', data?.id);
    return true;
  } catch (err) {
    console.error('❌ [upsertHeroSettings] Unexpected error:', err);
    const errorMsg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('❌ [upsertHeroSettings] Error details:', errorMsg);
    return false;
  }
}
