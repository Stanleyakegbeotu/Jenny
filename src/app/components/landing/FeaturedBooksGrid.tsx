import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Eye, BookOpen } from 'lucide-react';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { fetchBooks, Book as SupabaseBook } from '../../../lib/supabaseClient';
import { trackBookView, trackExternalLink } from '../../../lib/analytics';

const MAX_BOOKS_PER_PAGE = 3;

export function FeaturedBooksGrid({ onPreviewClick }: { onPreviewClick?: (book: SupabaseBook) => void }) {
  const [books, setBooks] = useState<SupabaseBook[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBooks() {
      try {
        const fetchedBooks = await fetchBooks();
        setBooks(fetchedBooks);
        setCurrentPage(0);
      } catch (error) {
        console.error('Error loading books:', error);
      } finally {
        setLoading(false);
      }
    }

    loadBooks();
  }, []);

  if (loading) {
    return (
      <section className="py-24 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <p className="text-muted-foreground">Loading featured books...</p>
        </div>
      </section>
    );
  }

  if (books.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(books.length / MAX_BOOKS_PER_PAGE);
  const startIndex = currentPage * MAX_BOOKS_PER_PAGE;
  const displayedBooks = books.slice(startIndex, startIndex + MAX_BOOKS_PER_PAGE);

  const handlePreviewClick = (book: SupabaseBook) => {
    trackBookView(book.id, book.title);
    if (onPreviewClick) {
      onPreviewClick(book);
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <section className="py-24 relative overflow-hidden" id="featured-books-grid">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-playfair mb-4">Featured Books</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our latest and most popular reads
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
          {displayedBooks.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              {/* Book Cover */}
              <div className="relative w-full h-80 overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                <ImageWithFallback
                  src={book.cover_url || 'https://via.placeholder.com/300x400'}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <h3 className="text-white text-xl font-playfair mb-2 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-white/80 text-sm mb-4 line-clamp-3">
                    {book.description}
                  </p>

                  <div className="flex items-center gap-2 mb-4">
                    <Eye className="w-4 h-4 text-primary" />
                    <span className="text-sm text-white/80">
                      {book.totalReads || 0} Reads
                    </span>
                  </div>

                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 w-full"
                    onClick={() => handlePreviewClick(book)}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </div>

              {/* Book Info (visible on mobile) */}
              <div className="lg:hidden p-4 bg-card">
                <h3 className="text-lg font-playfair mb-2 line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {book.description}
                </p>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 w-full"
                  onClick={() => handlePreviewClick(book)}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>
            </motion.div>
          ))}
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