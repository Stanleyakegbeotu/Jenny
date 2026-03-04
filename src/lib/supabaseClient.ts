import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔌 [Supabase Init] URL configured:', !!supabaseUrl);
console.log('🔌 [Supabase Init] Anon key configured:', !!supabaseAnonKey);
console.log('🔌 [Supabase Init] URL:', supabaseUrl);

const hasSupabaseConfig = !!(supabaseUrl && supabaseAnonKey);

if (!hasSupabaseConfig) {
  console.error(
    '❌ ERROR: Supabase not configured! Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local'
  );
}

// Create real Supabase client
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Test connection
supabase.from('books').select('count')
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ [Supabase Init] Connection test failed:', error);
    } else {
      console.log('✅ [Supabase Init] Connected successfully! Can access books table');
    }
  })
  .catch(err => console.error('❌ [Supabase Init] Connection test error:', err));

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
  is_active?: boolean; // Derived: true if unsubscribed_at is null
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
    console.log('📚 [fetchBooks] Starting fetch from books table...');
    const { data, error, status } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('📚 [fetchBooks] Response status:', status);
    console.log('📚 [fetchBooks] Response error:', error);
    console.log('📚 [fetchBooks] Books found:', data?.length || 0);

    if (error) {
      console.error('❌ [fetchBooks] Query failed:', error);
      throw error;
    }
    console.log('✅ [fetchBooks] Returning', data?.length || 0, 'books');
    return data || [];
  } catch (error) {
    console.error('❌ [fetchBooks] Exception:', error);
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
    console.log('📚 [createBook] Starting book creation with data:', book);
    
    const { data, error, status } = await supabase
      .from('books')
      .insert([book])
      .select()
      .single();

    console.log('📚 [createBook] Response status:', status);
    console.log('📚 [createBook] Response data:', data);
    console.log('📚 [createBook] Response error:', error);
    
    if (error) {
      console.error('❌ [createBook] Insert failed with error:', error);
      throw error;
    }
    
    console.log('✅ [createBook] Book created successfully:', data?.id);
    return data;
  } catch (error) {
    console.error('❌ [createBook] Exception caught:', error);
    const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
    console.error('❌ [createBook] Error details:', errorMsg);
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
    console.log('📖 [createChapter] Starting chapter creation for book:', chapter.book_id);
    console.log('📖 [createChapter] Chapter data:', chapter);
    
    const { data, error, status } = await supabase
      .from('chapters')
      .insert([chapter])
      .select()
      .single();

    console.log('📖 [createChapter] Response status:', status);
    console.log('📖 [createChapter] Response data:', data);
    console.log('📖 [createChapter] Response error:', error);
    
    if (error) {
      console.error('❌ [createChapter] Insert failed:', error);
      throw error;
    }
    
    console.log('✅ [createChapter] Chapter created successfully:', data?.id);
    return data;
  } catch (error) {
    console.error('❌ [createChapter] Exception caught:', error);
    const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
    console.error('❌ [createChapter] Error details:', errorMsg);
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
      console.log('📧 Subscriber already exists:', email);
      return existing;
    }

    const { data, error } = await supabase
      .from('subscribers')
      .insert([{ email, country: country || null }])
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
    
    // Add is_active derived property
    return (data || []).map(sub => ({
      ...sub,
      is_active: !sub.unsubscribed_at,
    }));
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return [];
  }
}

export async function unsubscribeEmail(email: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('subscribers')
      .update({ unsubscribed_at: new Date().toISOString() })
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
        },
      ])
      .select('id, name, email, message, created_at')
      .single();

    if (error) throw error;
    
    // Map created_at to sent_at for interface compatibility
    return {
      ...data,
      sent_at: data.created_at,
      read: false,
    } as unknown as ContactMessage;
  } catch (error) {
    console.error('Error saving contact message:', error);
    return null;
  }
}

export async function fetchContactMessages(): Promise<ContactMessage[]> {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('id, name, email, message, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    // Map created_at to sent_at for interface compatibility
    return ((data || []) as any[]).map(msg => {
      const message: ContactMessage = {
        id: msg.id,
        name: msg.name,
        email: msg.email,
        message: msg.message,
        sent_at: msg.created_at,
        read: false,
      };
      return message;
    });
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

    console.log('📡 Tracking event to database:', { eventType, userId, bookId, metadata });

    const eventRecord = {
      event_type: eventType,
      user_id: userId || 'anonymous',
      book_id: bookId || null,
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
    };

    // Try inserting with explicit book_id column first
    let insertResult = await supabase
      .from('analytics_events')
      .insert([eventRecord])
      .select()
      .single();

    // If schema doesn't include book_id (PGRST204), fallback by embedding bookId in metadata
    if (insertResult.error && insertResult.error.code === 'PGRST204') {
      console.warn('analytics_events schema missing book_id, falling back to metadata');
      const fallbackRecord = {
        event_type: eventType,
        user_id: userId || 'anonymous',
        metadata: { ...(metadata || {}), book_id: bookId || null },
        timestamp: new Date().toISOString(),
      };
      insertResult = await supabase
        .from('analytics_events')
        .insert([fallbackRecord])
        .select()
        .single();
    }

    const { data, error } = insertResult;

    if (error) {
      console.error('❌ Error tracking event:', { error, eventRecord });
      throw error;
    }
    console.log('✅ Event tracked successfully:', { id: data?.id, eventType });
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

    if (error) {
      console.error('Error fetching analytics:', error);
      return [];
    }
    
    console.log('✅ Fetched analytics events:', {
      total: data?.length || 0,
      startDate,
      endDate,
      eventTypes: data?.reduce((acc: any, e) => {
        acc[e.event_type] = (acc[e.event_type] || 0) + 1;
        return acc;
      }, {}),
    });
    
    return data || [];
  } catch (error) {
    console.error('Exception fetching analytics:', error);
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

export async function sendWelcomeEmail(email: string, country?: string): Promise<boolean> {
  try {
    console.log('📧 Sending welcome email to:', email);
    // This is now just a wrapper - actual sending is done via email service in saveSubscriber
    return true;
  } catch (error) {
    console.error('Error in sendWelcomeEmail wrapper:', error);
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
    console.log('📢 [likeBook] Starting with bookId:', bookId, 'userId:', userId);
    
    // Check if already liked
    const { data: existingLike, error: checkError } = await supabase
      .from('book_interactions')
      .select('id')
      .eq('book_id', bookId)
      .eq('user_id', userId)
      .eq('interaction_type', 'like')
      .maybeSingle();

    if (checkError) {
      console.warn('Warning checking existing like:', checkError);
    }

    // If already liked, don't add duplicate
    if (existingLike) {
      console.log('Already liked by user');
      return true;
    }

    console.log('📢 [likeBook] Inserting like record...');
    // Insert a like record
    const { data, error: insertError } = await supabase
      .from('book_interactions')
      .insert([{
        book_id: bookId,
        user_id: userId,
        interaction_type: 'like',
      }])
      .select();
    
    if (insertError) {
      console.error('❌ Error inserting like:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
      });
      return false;
    }

    console.log('✅ Like inserted successfully:', data);
    return true;
  } catch (error) {
    console.error('❌ Exception liking book:', error);
    return false;
  }
}

export async function isBookLikedByUser(bookId: string, userId: string = 'visitor'): Promise<boolean> {
  try {
    if (!hasSupabaseConfig) {
      console.warn('⚠️ Supabase not configured');
      return false;
    }

    // Check if user has liked this book
    const { data, error } = await supabase
      .from('book_interactions')
      .select('id')
      .eq('book_id', bookId)
      .eq('user_id', userId)
      .eq('interaction_type', 'like')
      .maybeSingle();

    if (error) {
      console.error('❌ Error checking like status:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('❌ Exception checking like status:', error);
    return false;
  }
}

export async function trackBookClick(bookId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('book_interactions')
      .insert([{
        book_id: bookId,
        user_id: 'visitor',
        interaction_type: 'click',
      }])
      .select();
    
    if (error) {
      console.error('❌ [trackBookClick] Error:', error);
      return false;
    }
    
    console.log('✅ [trackBookClick] Success:', data);
    return true;
  } catch (error) {
    console.error('❌ [trackBookClick] Exception:', error);
    return false;
  }
}

export async function trackBookRead(bookId: string): Promise<boolean> {
  try {
    console.log('📊 [trackBookRead] Starting:', bookId);
    const { data, error } = await supabase
      .from('book_interactions')
      .insert([{
        book_id: bookId,
        user_id: 'visitor',
        interaction_type: 'read',
      }])
      .select();
    
    if (error) {
      console.error('❌ [trackBookRead] Error:', error);
      return false;
    }
    
    console.log('✅ [trackBookRead] Success:', data);
    return true;
  } catch (error) {
    console.error('❌ [trackBookRead] Exception:', error);
    return false;
  }
}

export async function likeComment(commentId: string): Promise<boolean> {
  try {
    // Get current like count
    const { data: comment, error: selectError } = await supabase
      .from('book_comments')
      .select('likes')
      .eq('id', commentId)
      .maybeSingle();

    if (selectError) {
      console.error('❌ Error fetching comment:', selectError);
      return false;
    }

    if (!comment) {
      console.error('❌ Comment not found');
      return false;
    }

    // Increment likes
    const { data, error: updateError } = await supabase
      .from('book_comments')
      .update({ likes: (comment.likes || 0) + 1 })
      .eq('id', commentId)
      .select();

    if (updateError) {
      console.error('❌ Error updating comment likes:', {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
      });
      return false;
    }

    console.log('✅ Comment like updated successfully:', data);
    return true;
  } catch (error) {
    console.error('❌ Exception liking comment:', error);
    return false;
  }
}

export async function deleteSubscriber(subscriberId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🗑️ Attempting to delete subscriber:', subscriberId);
    
    const { error, data } = await supabase
      .from('subscribers')
      .delete()
      .eq('id', subscriberId)
      .select();

    if (error) {
      console.error('❌ Error deleting subscriber:', error);
      console.error('Error details:', { code: error.code, message: error.message, details: error.details });
      return { success: false, error: error.message || 'Failed to delete subscriber' };
    }

    console.log('✅ Subscriber deleted successfully:', data);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error deleting subscriber:', error);
    return { success: false, error: errorMessage };
  }
}

// ============================================================================
// GET LIKE COUNTS (NEW - THIS WAS MISSING!)
// ============================================================================

/**
 * Get total likes count for a book from book_interactions table
 */
export async function getBookLikeCount(bookId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('book_interactions')
      .select('id')
      .eq('book_id', bookId)
      .eq('interaction_type', 'like');

    if (error) {
      console.error('Error counting book likes:', error);
      return 0;
    }

    return (data || []).length;
  } catch (error) {
    console.error('Error in getBookLikeCount:', error);
    return 0;
  }
}

/**
 * Get like count from book_comments table for a specific book
 */
export async function getCommentLikesForBook(bookId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('book_comments')
      .select('likes')
      .eq('book_id', bookId);

    if (error) {
      console.error('Error getting comment likes:', error);
      return 0;
    }

    return (data || []).reduce((sum, comment) => sum + (comment.likes || 0), 0);
  } catch (error) {
    console.error('Error in getCommentLikesForBook:', error);
    return 0;
  }
}

/**
 * Get total read count for a book from book_interactions table
 */
export async function getBookReadCount(bookId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('book_interactions')
      .select('id')
      .eq('book_id', bookId)
      .eq('interaction_type', 'read');

    if (error) {
      console.error('Error counting book reads:', error);
      return 0;
    }

    return (data || []).length;
  } catch (error) {
    console.error('Error in getBookReadCount:', error);
    return 0;
  }
}

/**
 * Get total click count for a book from book_interactions table
 */
export async function getBookClickCount(bookId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('book_interactions')
      .select('id')
      .eq('book_id', bookId)
      .eq('interaction_type', 'click');

    if (error) {
      console.error('Error counting book clicks:', error);
      return 0;
    }

    return (data || []).length;
  } catch (error) {
    console.error('Error in getBookClickCount:', error);
    return 0;
  }
}

// ============================================================================
// AUTHOR STATS - AUTOMATIC CALCULATION FROM DATABASE
// ============================================================================

/**
 * Get total reads count from all books
 */
export async function getTotalReadsCount(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('total_reads');

    if (error) {
      console.error('Error calculating total reads:', error);
      return 0;
    }

    const total = (data || []).reduce((sum, book) => sum + (book.total_reads || 0), 0);
    console.log('📚 Total reads calculated:', total);
    return total;
  } catch (error) {
    console.error('Error in getTotalReadsCount:', error);
    return 0;
  }
}

/**
 * Get total books published count
 */
export async function getTotalBooksPublished(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('id', { count: 'exact' });

    if (error) {
      console.error('Error calculating books published:', error);
      return 0;
    }

    const count = data?.length || 0;
    console.log('📖 Total books published calculated:', count);
    return count;
  } catch (error) {
    console.error('Error in getTotalBooksPublished:', error);
    return 0;
  }
}

/**
 * Get total active subscribers count
 */
export async function getTotalSubscribersCount(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .select('id')
      .is('unsubscribed_at', null); // Only count active subscribers

    if (error) {
      console.error('Error calculating subscribers:', error);
      return 0;
    }

    const count = (data || []).length;
    console.log('👥 Total subscribers calculated:', count);
    return count;
  } catch (error) {
    console.error('Error in getTotalSubscribersCount:', error);
    return 0;
  }
}