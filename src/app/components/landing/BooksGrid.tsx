import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Volume2 } from 'lucide-react';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { fetchBooks, fetchChapters, Book as SupabaseBook } from '../../../lib/supabaseClient';
import { trackBookView, trackExternalLink } from '../../../lib/analytics';
import { useTextToSpeech } from '../../../hooks/useTextToSpeech';

export function BooksGrid({ onPreviewClick }: { onPreviewClick: (book: SupabaseBook) => void }) {
  const [books, setBooks] = useState<SupabaseBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBooks() {
      try {
        setLoading(true);
        const data = await fetchBooks();
        setBooks(data);
        setError(null);
      } catch (err) {
        console.error('Error loading books:', err);
        setBooks([]);
        setError('Unable to load books');
      } finally {
        setLoading(false);
      }
    }

    loadBooks();
  }, []);

  return (
    <section id="books" className="py-24 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2
            className="text-3xl md:text-4xl mb-2 font-playfair"
          >
            Discover More Stories
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore a collection of romantic tales that will touch your heart and ignite your
            imagination.
          </p>
        </motion.div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading books...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {!loading && books.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No books available yet.</p>
          </div>
        )}

        {!loading && books.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {books.map((book, index) => (
              <BookCard key={book.id} book={book} index={index} onPreviewClick={onPreviewClick} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function BookCard({ book, index, onPreviewClick }: { book: SupabaseBook; index: number; onPreviewClick: (book: SupabaseBook) => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const [chapter1Text, setChapter1Text] = useState<string>('');
  const { isSupported: ttsSupported, isSpeaking, speak, stop } = useTextToSpeech();

  useEffect(() => {
    // Load chapter 1 text for TTS
    const loadChapterText = async () => {
      try {
        const chapters = await fetchChapters(book.id);
        if (chapters.length > 0) {
          setChapter1Text(chapters[0].content || '');
        }
      } catch (err) {
        console.error('Error loading chapter text:', err);
      }
    };

    loadChapterText();
  }, [book.id]);

  const handlePreviewClick = () => {
    trackBookView(book.id, book.title);
    onPreviewClick(book);
  };

  const handleExternalLink = (platform: string, url?: string) => {
    if (url) {
      trackExternalLink(platform, book.id, book.title);
      window.open(url, '_blank');
    }
  };

  const handleReadAloud = () => {
    if (isSpeaking) {
      stop();
    } else {
      const textToRead = `${book.description}. ${chapter1Text}`;
      speak(textToRead);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group"
    >
      <motion.div
        animate={{
          y: isHovered ? -10 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-border"
      >
        {/* Book Cover */}
        <div className="relative h-80 overflow-hidden">
          <ImageWithFallback
            src={book.cover_url || 'https://via.placeholder.com/300x400'}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Glow effect on hover */}
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-primary/20 mix-blend-overlay"
            />
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-2xl mb-2 font-playfair">
            {book.title}
          </h3>
          <p className="text-muted-foreground mb-6 line-clamp-2">{book.description}</p>

          <div className="flex flex-col gap-3">
            <Button
              className="w-full bg-primary hover:bg-primary/90"
              onClick={handlePreviewClick}
            >
              <BookOpen className="w-4 h-4 mr-2 text-[var(--icon-primary)]" />
              Preview Chapter
            </Button>
            
            {/* TTS Button */}
            {ttsSupported && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleReadAloud}
              >
                <Volume2 className="w-4 h-4 mr-2 text-[var(--icon-warning)]" />
                {isSpeaking ? 'Stop Reading' : 'Read Aloud'}
              </Button>
            )}

            {/* Platform Links - Only show if URLs provided */}
            <div className="flex gap-2 flex-wrap">
              {book.inkitt_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleExternalLink('Inkitt', book.inkitt_url)}
                >
                  Inkitt
                </Button>
              )}
              {book.wattpad_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleExternalLink('Wattpad', book.wattpad_url)}
                >
                  Wattpad
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
