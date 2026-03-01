import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { useI18n } from '../../../hooks/useI18n';
import { getAuthorSettings as getAuthorSettingsFromDB } from '../../../lib/siteSettings';

interface Review {
  id: string;
  quote: string;
  author: string;
  platform: string;
  rating: number;
}

const REVIEWS_PER_PAGE = 3;

export function SocialProof() {
  const { t } = useI18n();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  // Load reviews from Supabase
  useEffect(() => {
    const loadReviews = async () => {
      try {
        const authorSettings = await getAuthorSettingsFromDB();
        if (authorSettings && authorSettings.reviews && Array.isArray(authorSettings.reviews)) {
          setReviews(authorSettings.reviews);
          setCurrentPage(0);
        }
      } catch (error) {
        console.error('Error loading reviews:', error);
      }
    };
    loadReviews();
  }, []);

  if (reviews.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const startIndex = currentPage * REVIEWS_PER_PAGE;
  const displayedReviews = reviews.slice(startIndex, startIndex + REVIEWS_PER_PAGE);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };
  return (
    <section className="py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl mb-4 font-playfair">
            {t('socialProof.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('socialProof.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {displayedReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gradient-to-br from-card to-secondary rounded-2xl p-8 shadow-lg border border-border hover:shadow-2xl transition-shadow duration-300"
            >
              <Quote className="w-10 h-10 text-primary/30 mb-4" />
              
              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>

              <p className="text-foreground mb-6 leading-relaxed italic">
                "{review.quote}"
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <div className="font-medium text-foreground">{review.author}</div>
                  <div className="text-sm text-muted-foreground">{review.platform}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

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
