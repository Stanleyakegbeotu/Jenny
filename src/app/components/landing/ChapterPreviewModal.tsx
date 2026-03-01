import { useEffect, useState } from 'react';
import { X, ExternalLink, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { AudioPlayer } from './AudioPlayer';
import { Book as SupabaseBook, fetchChapters, Chapter } from '../../../lib/supabaseClient';
import { trackPreviewOpen, trackChapterRead, trackExternalLink } from '../../../lib/analytics';
import { useTextToSpeech } from '../../../hooks/useTextToSpeech';

interface ChapterPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: SupabaseBook | null;
}

export function ChapterPreviewModal({ isOpen, onClose, book }: ChapterPreviewModalProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasTrackedRead, setHasTrackedRead] = useState(false);
  const { isSupported: ttsSupported, isSpeaking, speak, stop } = useTextToSpeech();

  useEffect(() => {
    if (!isOpen || !book) return;

    async function loadChapters() {
      try {
        setLoading(true);
        setHasTrackedRead(false); // Reset tracking when modal opens
        if (book) {
          trackPreviewOpen(book.id, book.title);
          const data = await fetchChapters(book.id);
          setChapters(data);
          setError(null);
        }
      } catch (err) {
        setError('Failed to load chapter');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadChapters();
  }, [isOpen, book]);

  const handleTtsToggle = () => {
    if (!book || chapters.length === 0) return;
    
    const firstChapter = chapters[0];
    const defaultContent = `The evening sun painted the sky in shades of amber and rose as the story begins. This is a preview of the chapter. To read the full content, click "Continue on Inkitt" or "Continue on Wattpad" below.`;
    const chapterContent = firstChapter?.preview_text || firstChapter?.content || defaultContent;
    
    if (isSpeaking) {
      stop();
    } else {
      speak(chapterContent);
    }
  };

  // Handle scroll detection to track when user reaches end
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (hasTrackedRead || !book || !chapters[0]) return;

    const element = e.currentTarget;
    const scrollPosition = element.scrollTop + element.clientHeight;
    const totalHeight = element.scrollHeight;
    const threshold = 0.9; // Track when user scrolls to 90% of content

    if (scrollPosition >= totalHeight * threshold) {
      setHasTrackedRead(true);
      trackChapterRead(book.id, chapters[0].id, chapters[0].title);
    }
  };

  if (!book) return null;

  const firstChapter = chapters[0];
  const defaultContent = `The evening sun painted the sky in shades of amber and rose as the story begins. This is a preview of the chapter. To read the full content, click "Continue on Inkitt" or "Continue on Wattpad" below.`;
  const chapterContent = firstChapter?.preview_text || firstChapter?.content || defaultContent;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-4 md:inset-10 lg:inset-20 bg-background rounded-3xl shadow-2xl z-50 overflow-hidden border border-border"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/30 gap-4">
              {/* Left: Book Info */}
              <div className="flex items-center gap-4 flex-1">
                <div className="w-16 h-20 rounded-lg overflow-hidden shadow-lg">
                  <ImageWithFallback
                    src={book.cover_url || 'https://via.placeholder.com/64x80'}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-playfair">
                    {book.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {chapters.length > 0 && chapters[0] ? `${chapters[0].title}` : 'Chapter Preview'}
                  </p>
                </div>
              </div>

              {/* Right: Play/Pause + Close Button */}
              <div className="flex items-center gap-3">
                {/* Play/Pause Button */}
                {ttsSupported && (
                  <Button
                    size="icon"
                    className={`rounded-full w-10 h-10 ${
                      isSpeaking
                        ? 'bg-accent hover:bg-accent/90'
                        : 'bg-primary hover:bg-primary/90'
                    }`}
                    onClick={handleTtsToggle}
                    title={isSpeaking ? 'Pause' : 'Play'}
                  >
                    {isSpeaking ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5" />
                    )}
                  </Button>
                )}

                {/* Close Button - Top Right Corner */}
                <Button 
                  size="icon" 
                  onClick={onClose}
                  className="bg-primary hover:bg-primary/90 rounded-full w-10 h-10"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <ScrollArea className="h-[calc(100%-200px)]" onScroll={handleScroll}>
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p>Loading chapter...</p>
                </div>
              ) : error ? (
                <div className="p-8 text-center text-destructive">
                  <p>{error}</p>
                </div>
              ) : (
                <div className="p-8 md:p-12 max-w-3xl mx-auto">
                  <div className="prose prose-lg dark:prose-invert">
                    {chapterContent.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="mb-6 leading-relaxed text-foreground">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-secondary/50 backdrop-blur-lg border-t border-border">
              <div className="max-w-3xl mx-auto space-y-4">
                {firstChapter?.chapter_number && (
                  <div className="text-xs text-muted-foreground mb-3">
                    Chapter {firstChapter.chapter_number}
                  </div>
                )}
                {book.book_link && book.book_platform && (
                  <a
                    href={book.book_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackExternalLink(book.book_platform || 'platform', book.id, book.title)}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors w-full"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Read Full Book on {book.book_platform}
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
