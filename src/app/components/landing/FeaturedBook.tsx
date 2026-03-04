import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, BookOpen, Users, Volume2, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { fetchBooks, Book as SupabaseBook } from '../../../lib/supabaseClient';
import { trackBookView, trackExternalLink } from '../../../lib/analytics';
import { useTextToSpeech } from '../../../hooks/useTextToSpeech';
import { useI18n } from '../../../hooks/useI18n';

const FEATURED_BOOKS_PER_PAGE = 3;

export function FeaturedBook({ onPreviewClick }: { onPreviewClick?: (book: SupabaseBook) => void }) {
  const { t } = useI18n();
  const [books, setBooks] = useState<SupabaseBook[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  const { isSupported: ttsSupported, isSpeaking, speak, stop } = useTextToSpeech();
  const [speakingBookId, setSpeakingBookId] = useState<string | null>(null);

  useEffect(() => {
    async function loadBooks() {
      try {
        console.log('📚 [FeaturedBook] Fetching featured books from database...');
        const fetchedBooks = await fetchBooks();
        console.log('✅ [FeaturedBook] Loaded', fetchedBooks.length, 'featured books');
        setBooks(fetchedBooks);
        setCurrentPage(0);
      } catch (error) {
        console.error('❌ [FeaturedBook] Error loading featured books:', error);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    }

    // Load books immediately
    loadBooks();

    // Refresh featured books every 30 seconds so visitors see admin updates in real-time
    const interval = setInterval(() => {
      console.log('🔄 [FeaturedBook] Periodic refresh of featured books...');
      loadBooks();
    }, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
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
          <h2 className="text-4xl md:text-5xl mb-4 font-playfair">Featured Books</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the latest stories crafted with passion and emotion
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
                        {isDescriptionExpanded ? 'Read Less' : 'Read More'}
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
                      {isSpeakingDescription ? 'Stop Description' : 'Listen Description'}
                    </button>
                  )}

                  {/* Preview Chapter Button */}
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 w-full mb-3"
                    onClick={() => handlePreviewClick(book)}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Preview Chapter One
                  </Button>

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
                      Read on {book.book_platform}
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
