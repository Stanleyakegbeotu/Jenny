import { useState, useEffect } from 'react';
import { Navbar } from '../components/landing/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { FeaturedBook } from '../components/landing/FeaturedBook';
import { ChapterPreviewModal } from '../components/landing/ChapterPreviewModal';
import { SocialProof } from '../components/landing/SocialProof';
import { AboutSection } from '../components/landing/AboutSection';
import { SubscribeSection } from '../components/landing/SubscribeSection';
import { ContactSection } from '../components/landing/ContactSection';
import { Footer } from '../components/landing/Footer';
import { Book as SupabaseBook } from '../../lib/supabaseClient';
import { trackPageView } from '../../lib/analytics';

export function LandingPage() {
  const [previewBook, setPreviewBook] = useState<SupabaseBook | null>(null);

  useEffect(() => {
    // Track landing page view
    trackPageView('landing_page');
  }, []);

  return (
    <div className="min-h-screen w-full bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <FeaturedBook onPreviewClick={setPreviewBook} />
      <SocialProof />
      <AboutSection />
      <SubscribeSection />
      <ContactSection />
      <Footer />
      
      <ChapterPreviewModal
        isOpen={previewBook !== null}
        onClose={() => setPreviewBook(null)}
        book={previewBook}
      />
    </div>
  );
}
