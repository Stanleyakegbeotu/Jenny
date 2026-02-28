import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const hasSupabaseConfig = !!(supabaseUrl && supabaseAnonKey);

if (!hasSupabaseConfig) {
  console.error(
    '❌ ERROR: Supabase not configured! Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local'
  );
}

// Create real Supabase client
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Book {
  id: string;
  title: string;
  description: string;
  cover_url: string;
  book_link?: string;
  book_platform?: string;
  created_at: string;
  updated_at: string;
  totalReads?: number;
  clicks?: number;
  likes?: number;
  commentCount?: number;
}

export interface BookComment {
  id: string;
  bookId: string;
  author: string;
  isAdmin?: boolean;
  content: string;
  likes: number;
  replies: BookComment[];
  createdAt: string;
  parentCommentId?: string;
}

export interface BookInteraction {
  bookId: string;
  userId: string;
  liked: boolean;
  liked_at?: string;
}

export interface Chapter {
  id: string;
  book_id: string;
  title: string;
  content: string;
  preview_text?: string;
  chapter_number: number;
  created_at: string;
}

export interface Subscriber {
  id: string;
  email: string;
  country?: string;
  subscribed_at: string;
  unsubscribed_at?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  sent_at: string;
  read: boolean;
}

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  user_id?: string;
  book_id?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

// Books Functions
export async function fetchBooks(): Promise<Book[]> {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
}

export async function fetchBook(id: string): Promise<Book | null> {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching book:', error);
    return null;
  }
}

export async function createBook(book: Omit<Book, 'id' | 'created_at' | 'updated_at'>): Promise<Book | null> {
  try {
    const { data, error } = await supabase
      .from('books')
      .insert([book])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating book:', error);
    return null;
  }
}

export async function updateBook(id: string, updates: Partial<Book>): Promise<Book | null> {
  try {
    const { data, error } = await supabase
      .from('books')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating book:', error);
    return null;
  }
}

export async function deleteBook(id: string): Promise<boolean> {
  try {
    console.log('Attempting to delete book:', id);
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete error details:', error);
      throw error;
    }
    console.log('Book deleted successfully:', id);
    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
    console.error('Error deleting book:', errorMsg);
    return false;
  }
}

// Chapters Functions
export async function fetchChapters(bookId: string): Promise<Chapter[]> {
  try {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('book_id', bookId)
      .order('chapter_number', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return [];
  }
}

export async function fetchChapter(id: string): Promise<Chapter | null> {
  try {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return null;
  }
}

export async function createChapter(chapter: Omit<Chapter, 'id' | 'created_at'>): Promise<Chapter | null> {
  try {
    const { data, error } = await supabase
      .from('chapters')
      .insert([chapter])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating chapter:', error);
    return null;
  }
}

export async function updateChapter(id: string, updates: Partial<Chapter>): Promise<Chapter | null> {
  try {
    const { data, error } = await supabase
      .from('chapters')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating chapter:', error);
    return null;
  }
}

export async function deleteChapter(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chapters')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting chapter:', error);
    return false;
  }
}

// Subscribers Functions
export async function saveSubscriber(email: string, country?: string): Promise<Subscriber | null> {
  try {
    // Check if already exists
    const { data: existing } = await supabase
      .from('subscribers')
      .select('*')
      .eq('email', email)
      .single();

    if (existing) {
      return existing;
    }

    const { data, error } = await supabase
      .from('subscribers')
      .insert([{ email, country: country || null, subscribed_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving subscriber:', error);
    return null;
  }
}

export async function fetchSubscribers(): Promise<Subscriber[]> {
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return [];
  }
}

export async function unsubscribeEmail(email: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('subscribers')
      .update({ is_active: false })
      .eq('email', email);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return false;
  }
}

// Contact Messages Functions
export async function saveContactMessage(
  name: string,
  email: string,
  message: string
): Promise<ContactMessage | null> {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([
        {
          name,
          email,
          message,
          sent_at: new Date().toISOString(),
          read: false,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving contact message:', error);
    return null;
  }
}

export async function fetchContactMessages(): Promise<ContactMessage[]> {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('sent_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return [];
  }
}

export async function markMessageAsRead(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('contact_messages')
      .update({ read: true })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking message as read:', error);
    return false;
  }
}

// Analytics Functions
export async function trackEvent(
  eventType: string,
  userId?: string,
  bookId?: string,
  metadata?: Record<string, unknown>
): Promise<AnalyticsEvent | null> {
  try {
    // Skip tracking if Supabase is not configured
    if (!hasSupabaseConfig) {
      console.log('📊 Analytics (local):', { eventType, bookId, userId });
      return null;
    }

    const { data, error } = await supabase
      .from('analytics_events')
      .insert([
        {
          event_type: eventType,
          user_identifier: userId,
          book_id: bookId,
          timestamp: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    // Silently fail for analytics - don't block user interactions
    console.debug('Analytics event not tracked (this is OK):', error);
    return null;
  }
}

export async function fetchAnalytics(startDate?: string, endDate?: string): Promise<AnalyticsEvent[]> {
  try {
    let query = supabase.from('analytics_events').select('*');

    if (startDate) {
      query = query.gte('timestamp', startDate);
    }
    if (endDate) {
      query = query.lte('timestamp', endDate);
    }

    const { data, error } = await query.order('timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return [];
  }
}

// Storage Functions
export async function uploadAuthorImage(file: File, authorId: string): Promise<string | null> {
  try {
    if (!hasSupabaseConfig) {
      // For dummy client, use data URL
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${authorId}-${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('author-images')
      .upload(fileName, file, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage
      .from('author-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading author image:', error);
    return null;
  }
}

export async function uploadCover(file: File, bookId: string): Promise<string | null> {
  try {
    if (!hasSupabaseConfig) {
      // For dummy client, use data URL
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${bookId}-${Date.now()}.${fileExt}`;

    console.log('Uploading file:', fileName, 'to bucket: book-covers');

    const { error } = await supabase.storage
      .from('book-covers')
      .upload(fileName, file, { upsert: true });

    if (error) {
      console.error('Upload error details:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data } = supabase.storage
      .from('book-covers')
      .getPublicUrl(fileName);

    console.log('File uploaded successfully:', data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error during upload';
    console.error('Error uploading cover:', errorMsg);
    throw new Error(`Failed to upload cover: ${errorMsg}`);
  }
}

export async function uploadAudio(file: File, chapterId: string): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${chapterId}-${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('chapter-audio')
      .upload(fileName, file, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage
      .from('chapter-audio')
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading audio:', error);
    return null;
  }
}

export async function uploadChapterPreview(file: File, chapterId: string): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${chapterId}-${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('chapter-previews')
      .upload(fileName, file, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage
      .from('chapter-previews')
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading chapter preview:', error);
    return null;
  }
}
// Email Functions
export async function sendBulkEmail(
  emails: string[],
  subject: string,
  message: string
): Promise<boolean> {
  try {
    if (!emails.length) {
      throw new Error('No emails provided');
    }

    // This is a placeholder that logs the email data
    // In production, integrate with:
    // - Supabase Edge Functions
    // - SendGrid API
    // - Resend API
    // - AWS SES
    // - Or any other email service

    console.log('📧 Sending bulk email:', {
      recipientCount: emails.length,
      recipients: emails,
      subject,
      message,
      timestamp: new Date().toISOString(),
    });

    // TODO: Replace with actual email service integration
    // Example with hypothetical API endpoint:
    /*
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails, subject, message }),
    });

    if (!response.ok) throw new Error('Failed to send emails');
    return true;
    */

    // For now, return success after logging
    // Update this when you integrate a real email service
    return true;
  } catch (error) {
    console.error('Error sending bulk email:', error);
    return false;
  }
}

export async function sendWelcomeEmail(email: string, name?: string): Promise<boolean> {
  try {
    console.log('📧 Sending welcome email to:', email);

    // TODO: Implement welcome email logic with email service integration
    // This could include personalized content, book recommendations, etc.

    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

// Book Comments and Interactions
export async function addBookComment(
  bookId: string,
  author: string,
  content: string,
  parentCommentId?: string
): Promise<BookComment | null> {
  try {
    const { data, error } = await supabase
      .from('book_comments')
      .insert([{
        book_id: bookId,
        author,
        content,
        parent_comment_id: parentCommentId,
        is_admin: false,
        likes: 0,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding comment details:', error);
      throw error;
    }

    return {
      id: data.id,
      bookId: data.book_id,
      author: data.author,
      isAdmin: data.is_admin,
      content: data.content,
      likes: data.likes,
      replies: [],
      createdAt: data.created_at,
      parentCommentId: data.parent_comment_id,
    };
  } catch (error) {
    console.error('Error adding comment:', error);
    return null;
  }
}

export async function getBookComments(bookId: string): Promise<BookComment[]> {
  try {
    const { data, error } = await supabase
      .from('book_comments')
      .select('*')
      .eq('book_id', bookId)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(c => ({
      id: c.id,
      bookId: c.book_id,
      author: c.author,
      isAdmin: c.is_admin,
      content: c.content,
      likes: c.likes,
      replies: [],
      createdAt: c.created_at,
      parentCommentId: c.parent_comment_id,
    }));
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

export async function getBookCommentsCount(bookId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('book_comments')
      .select('*', { count: 'exact', head: true })
      .eq('book_id', bookId)
      .is('parent_comment_id', null);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error counting comments:', error);
    return 0;
  }
}

export async function getBookCommentLikesTotal(bookId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('book_comments')
      .select('likes')
      .eq('book_id', bookId)
      .is('parent_comment_id', null);

    if (error) throw error;
    const totalLikes = (data || []).reduce((sum, comment) => sum + (comment.likes || 0), 0);
    return totalLikes;
  } catch (error) {
    console.error('Error counting likes:', error);
    return 0;
  }
}

export async function replyToComment(
  parentCommentId: string,
  author: string,
  content: string,
  isAdmin = false
): Promise<BookComment | null> {
  try {
    // Get parent comment to get bookId
    const { data: parentData, error: selectError } = await supabase
      .from('book_comments')
      .select('book_id')
      .eq('id', parentCommentId)
      .maybeSingle();

    if (selectError) {
      console.error('Error fetching parent comment:', selectError);
      return null;
    }

    if (!parentData) {
      console.error('Parent comment not found');
      return null;
    }

    const { data, error } = await supabase
      .from('book_comments')
      .insert([{
        book_id: parentData.book_id,
        author,
        content,
        parent_comment_id: parentCommentId,
        is_admin: isAdmin,
        likes: 0,
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      bookId: data.book_id,
      author: data.author,
      isAdmin: data.is_admin,
      content: data.content,
      likes: data.likes,
      replies: [],
      createdAt: data.created_at,
      parentCommentId: data.parent_comment_id,
    };
  } catch (error) {
    console.error('Error replying to comment:', error);
    return null;
  }
}

export async function likeBook(bookId: string, userId: string = 'visitor'): Promise<boolean> {
  try {
    // Check if like exists
    const { data: interaction, error: selectError } = await supabase
      .from('book_interactions')
      .select('*')
      .eq('book_id', bookId)
      .eq('user_id', userId)
      .maybeSingle();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking like status:', selectError);
      throw selectError;
    }

    if (interaction && interaction.liked) {
      // Unlike
      const { error: updateError } = await supabase
        .from('book_interactions')
        .update({ liked: false })
        .eq('id', interaction.id);
      if (updateError) throw updateError;
    } else if (interaction) {
      // Like
      const { error: updateError } = await supabase
        .from('book_interactions')
        .update({ liked: true, liked_at: new Date().toISOString() })
        .eq('id', interaction.id);
      if (updateError) throw updateError;
    } else {
      // New like
      const { error: insertError } = await supabase
        .from('book_interactions')
        .insert([{
          book_id: bookId,
          user_id: userId,
          liked: true,
          liked_at: new Date().toISOString(),
        }]);
      if (insertError) throw insertError;
    }

    return true;
  } catch (error) {
    console.error('Error liking book:', error);
    return false;
  }
}

export async function isBookLikedByUser(bookId: string, userId: string = 'visitor'): Promise<boolean> {
  try {
    if (!hasSupabaseConfig) return false;

    const { data, error } = await supabase
      .from('book_interactions')
      .select('liked')
      .eq('book_id', bookId)
      .eq('user_id', userId)
      .single();

    if (error) return false;
    return data?.liked || false;
  } catch (error) {
    console.debug('Could not check like status (this is OK):', error);
    return false;
  }
}

export async function trackBookClick(bookId: string): Promise<boolean> {
  try {
    await supabase
      .from('book_interactions')
      .insert([{
        book_id: bookId,
        user_id: 'visitor',
        interaction_type: 'click',
        clicked_at: new Date().toISOString(),
      }]);
    return true;
  } catch (error) {
    console.error('Error tracking click:', error);
    return false;
  }
}

export async function trackBookRead(bookId: string): Promise<boolean> {
  try {
    await supabase
      .from('book_interactions')
      .insert([{
        book_id: bookId,
        user_id: 'visitor',
        interaction_type: 'read',
        read_at: new Date().toISOString(),
      }]);
    return true;
  } catch (error) {
    console.error('Error tracking read:', error);
    return false;
  }
}