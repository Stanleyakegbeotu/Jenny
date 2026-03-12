import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, BookOpen, Volume2, ExternalLink, MessageCircle, Heart } from 'lucide-react';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import {
  fetchBooks,
  Book as SupabaseBook,
  getBookCommentsCount,
  getBookReactionsSummary,
  getUserBookReaction,
  addBookReaction,
  ReactionType,
} from '../../../lib/supabaseClient';
import { trackBookView, trackExternalLink } from '../../../lib/analytics';
import { useTextToSpeech } from '../../../hooks/useTextToSpeech';
import { useI18n } from '../../../hooks/useI18n';
import { subscribeToPublish } from '../../../lib/publishManager';
import { getVisitorId } from '../../../lib/visitorId';
import { BookComments } from './BookComments';

const FEATURED_BOOKS_PER_PAGE = 3;

export function FeaturedBook({ onPreviewClick }: { onPreviewClick?: (book: SupabaseBook) => void }) {
  const { t } = useI18n();
  const [books, setBooks] = useState<SupabaseBook[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  const { isSupported: ttsSupported, isSpeaking, speak, stop } = useTextToSpeech();
  const [speakingBookId, setSpeakingBookId] = useState<string | null>(null);
  const [reactionSummary, setReactionSummary] = useState<Record<string, Record<string, number>>>({});
  const [userReactions, setUserReactions] = useState<Record<string, ReactionType | null>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [openReactions, setOpenReactions] = useState<Record<string, boolean>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});

  const REACTIONS: { type: ReactionType; label: string; emoji: string }[] = [
    { type: 'like', label: t('reactions.like', 'Like'), emoji: '👍' },
    { type: 'love', label: t('reactions.love', 'Love'), emoji: '❤️' },
    { type: 'wow', label: t('reactions.wow', 'Wow'), emoji: '😮' },
    { type: 'sad', label: t('reactions.sad', 'Sad'), emoji: '😢' },
    { type: 'angry', label: t('reactions.angry', 'Angry'), emoji: '😡' },
  ];

  useEffect(() => {
    async function loadBooks() {
      try {
        console.log('📚 [FeaturedBook] Fetching featured books from database...');
        const fetchedBooks = await fetchBooks();
        console.log('✅ [FeaturedBook] Loaded', fetchedBooks.length, 'featured books');
        setBooks(fetchedBooks);
        setCurrentPage(0);
        const visitorId = getVisitorId();
        const summaries = await Promise.all(
          fetchedBooks.map(async (b) => ({
            bookId: b.id,
            reactions: await getBookReactionsSummary(b.id),
            userReaction: await getUserBookReaction(b.id, visitorId),
            comments: await getBookCommentsCount(b.id),
          }))
        );
        const nextSummary: Record<string, Record<string, number>> = {};
        const nextUser: Record<string, ReactionType | null> = {};
        const nextComments: Record<string, number> = {};
        summaries.forEach((s) => {
          nextSummary[s.bookId] = s.reactions;
          nextUser[s.bookId] = s.userReaction;
          nextComments[s.bookId] = s.comments;
        });
        setReactionSummary(nextSummary);
        setUserReactions(nextUser);
        setCommentCounts(nextComments);
      } catch (error) {
        console.error('❌ [FeaturedBook] Error loading featured books:', error);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    }

    // Load books immediately
    loadBooks();

    // Subscribe to publish events for instant updates
    const unsubscribe = subscribeToPublish((event) => {
      if (event.type === 'full-refresh') {
        console.log('📢 [FeaturedBook] Received publish event, refreshing featured books...');
        loadBooks();
      }
    });

    // Refresh featured books every 30 seconds so visitors see admin updates in real-time
    const interval = setInterval(() => {
      console.log('🔄 [FeaturedBook] Periodic refresh of featured books...');
      loadBooks();
    }, 30000);

    // Cleanup interval and subscription on unmount
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <section className="py-24 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <p className="text-muted-foreground">{t('featured.loading', 'Loading featured books...')}</p>
        </div>
      </section>
    );
  }

  if (books.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(books.length / FEATURED_BOOKS_PER_PAGE);
  const startIndex = currentPage * FEATURED_BOOKS_PER_PAGE;
  const displayedBooks = books.slice(startIndex, startIndex + FEATURED_BOOKS_PER_PAGE);

  const toggleDescription = (bookId: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [bookId]: !prev[bookId]
    }));
  };

  const handlePreviewClick = (book: SupabaseBook) => {
    trackBookView(book.id, book.title);
    if (onPreviewClick) {
      onPreviewClick(book);
    }
  };

  const handleExternalLink = (platform: string, bookId: string, bookTitle: string) => {
    trackExternalLink(platform, bookId, bookTitle);
  };

  const handleSpeakDescription = (bookId: string, description: string) => {
    if (isSpeaking && speakingBookId === bookId) {
      stop();
      setSpeakingBookId(null);
    } else {
      if (isSpeaking) stop();
      speak(description);
      setSpeakingBookId(bookId);
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const handleOpenReactions = (bookId: string) => {
    setOpenReactions((prev) => ({ ...prev, [bookId]: !prev[bookId] }));
  };

  const handleOpenComments = (bookId: string) => {
    setOpenComments((prev) => ({ ...prev, [bookId]: !prev[bookId] }));
  };

  const handleReact = async (bookId: string, reaction: ReactionType) => {
    const visitorId = getVisitorId();
    const result = await addBookReaction(bookId, visitorId, reaction);
    if (result.success) {
      const summary = await getBookReactionsSummary(bookId);
      setReactionSummary((prev) => ({ ...prev, [bookId]: summary }));
      setUserReactions((prev) => ({ ...prev, [bookId]: reaction }));
    }
  };

  return (
    <section className="py-24 relative overflow-hidden" id="featured-books">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl mb-4 font-playfair">
            {t('featured.title', 'Featured Books')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('featured.subtitle', 'Discover the latest stories crafted with passion and emotion')}
          </p>
        </motion.div>

        {/* Books Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
        >
          {displayedBooks.map((book, index) => {
            const isDescriptionExpanded = expandedDescriptions[book.id] || false;
            const descriptionPreview = book.description?.substring(0, 150) + (book.description && book.description.length > 150 ? '...' : '');
            const displayDescription = isDescriptionExpanded ? book.description : descriptionPreview;
            const shouldShowReadMore = book.description && book.description.length > 150;
            const isSpeakingDescription = isSpeaking && speakingBookId === book.id;

            return (
            <div key={book.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col"
              >
                {/* Book Cover - Fixed aspect ratio */}
                <div className="relative w-full aspect-[3/4] overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                  <ImageWithFallback
                    src={book.cover_url || 'https://via.placeholder.com/300x400'}
                    alt={book.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Book Info */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-lg font-playfair mb-2 line-clamp-2">
                    {book.title}
                  </h3>
                  
                  {/* Description with Read More/Less */}
                  <div className="mb-4 flex-1">
                    <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                      {displayDescription}
                    </p>
                    {shouldShowReadMore && (
                      <button
                        onClick={() => toggleDescription(book.id)}
                        className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        {isDescriptionExpanded
                          ? t('featured.readLess', 'Read Less')
                          : t('featured.readMore', 'Read More')}
                      </button>
                    )}
                  </div>

                  {/* TTS for Description */}
                  {ttsSupported && book.description && (
                    <button
                      onClick={() => handleSpeakDescription(book.id, book.description || '')}
                      className={`w-full mb-3 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isSpeakingDescription
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                      {isSpeakingDescription
                        ? t('featured.stopDescription', 'Stop Description')
                        : t('featured.listenDescription', 'Listen Description')}
                    </button>
                  )}

                {/* Preview Chapter Button */}
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 w-full mb-3"
                  onClick={() => handlePreviewClick(book)}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                    {t('featured.previewChapterOne', 'Preview Chapter One')}
                  </Button>

                {/* Engagement + Reactions/Comments */}
                <div className="border-t border-border/40 pt-3 mt-2 space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {t('featured.engagement', 'Engagement')}:{' '}
                      {Object.values(reactionSummary[book.id] || {}).reduce((a, b) => a + b, 0) +
                        (commentCounts[book.id] || 0)}
                    </span>
                    <span>
                      {t('featured.comments', 'Comments')}: {commentCounts[book.id] || 0}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenReactions(book.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border/50 text-sm hover:bg-secondary transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      {userReactions[book.id]
                        ? t('featured.reacted', 'Reacted')
                        : t('featured.react', 'React')}
                    </button>
                    <button
                      onClick={() => handleOpenComments(book.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border/50 text-sm hover:bg-secondary transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {t('featured.comment', 'Comment')}
                    </button>
                  </div>

                  {openReactions[book.id] && (
                    <div className="rounded-lg border border-border/40 bg-card p-3 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {REACTIONS.map((r) => (
                          <button
                            key={r.type}
                            onClick={() => handleReact(book.id, r.type)}
                            disabled={!!userReactions[book.id]}
                            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                              userReactions[book.id]
                                ? 'bg-muted text-muted-foreground border-border/40'
                                : 'bg-secondary hover:bg-secondary/70 border-border/50'
                            }`}
                            title={r.label}
                          >
                            <span className="mr-1">{r.emoji}</span>
                            {r.label}
                          </button>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t('featured.reactions', 'Reactions')}:{' '}
                        {REACTIONS.map((r) => (
                          <span key={r.type} className="mr-3">
                            {r.emoji} {reactionSummary[book.id]?.[r.type] || 0}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {openComments[book.id] && (
                    <div className="max-h-96 overflow-y-auto">
                      <BookComments
                        bookId={book.id}
                        onCountChange={(count) =>
                          setCommentCounts((prev) => ({ ...prev, [book.id]: count }))
                        }
                      />
                    </div>
                  )}
                </div>

                {/* External Links */}
                {book.book_link && book.book_platform && (
                    <a
                      href={book.book_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleExternalLink(book.book_platform || 'platform', book.id, book.title)}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors w-full"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {t('featured.readOn', 'Read on')} {book.book_platform}
                    </a>
                  )}
                </div>
              </motion.div>
            </div>
            );
          })}
        </motion.div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-6"
          >
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousPage}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                    currentPage === index
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </motion.div>
        )}

        {/* Page Info */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mt-6 text-sm text-muted-foreground"
          >
            Page {currentPage + 1} of {totalPages}
          </motion.div>
        )}
      </div>
    </section>
  );
}
