import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { useI18n } from '../../../hooks/useI18n';
import { trackExternalLink } from '../../../lib/analytics';
import { getHeroSettings, getSiteSettings } from '../../../lib/siteSettings';
import { subscribeToPublish } from '../../../lib/publishManager';

interface PlatformLink {
  name: string;
  url: string;
}

interface SiteSettings {
  heroImage?: string;
  platformLinks?: PlatformLink[];
}

const DEFAULT_HERO_TEXTS = [
  'Discover Cinematic Stories',
  'Feel Love in Every Page',
  'Enter Worlds of Passion',
  'Experience Romance Like Never Before',
];

const DEFAULT_PARAGRAPH_TEXTS = [
  'Immerse yourself in captivating narratives crafted with cinematic precision. Each story is designed to transport you into worlds of passion, mystery, and unforgettable emotions.',
  'Experience the art of storytelling through emotionally rich characters and intricately woven plots. Discover tales that will make your heart race and linger in your mind long after the final page.',
  'Step into universes where love transcends boundaries and emotions run deep. These carefully curated stories blend romance, adventure, and profound human connection.',
  'Explore narratives that capture the essence of human emotion in its most beautiful form. Every chapter is a journey through passion, desire, and the transformative power of love.',
];

// Typing animation component
function TypingText({ text }: { text: string }) {
  const characters = text.split('');
  
  return (
    <span>
      {characters.map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.03,
            delay: index * 0.03,
          }}
          style={{ display: 'inline' }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

export function HeroSection() {
  const { t } = useI18n();
  const [windowSize, setWindowSize] = useState({ width: 1024, height: 768 });
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({});
  const [showPlatforms, setShowPlatforms] = useState(false);
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const heroTexts = (t('hero.rotatingTitles', { returnObjects: true }) as string[]) || DEFAULT_HERO_TEXTS;
  const paragraphTexts =
    (t('hero.rotatingParagraphs', { returnObjects: true }) as string[]) || DEFAULT_PARAGRAPH_TEXTS;

  // Rotate hero text every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % heroTexts.length);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [heroTexts.length]);

  // Load site settings from Supabase
  useEffect(() => {
    const loadSettings = async () => {
      try {
        console.log('🚀 [HeroSection] Fetching hero settings from database...');
        const [heroSettings, site] = await Promise.all([
          getHeroSettings(),
          getSiteSettings(),
        ]);

        setSiteSettings({
          heroImage: heroSettings?.heroImage,
          platformLinks: site?.platformLinks || [],
        });
      } catch (error) {
        console.error('❌ [HeroSection] Error loading hero settings from Supabase:', error);
        // Fall back to empty defaults
      }
    };

    // Load settings immediately
    loadSettings();

    // Subscribe to publish events for instant updates
    const unsubscribe = subscribeToPublish((event) => {
      if (event.type === 'full-refresh') {
        console.log('📢 [HeroSection] Received publish event, refreshing hero settings...');
        loadSettings();
      }
    });

    // Refresh hero settings every 30 seconds so visitors see admin updates in real-time
    const interval = setInterval(() => {
      console.log('🔄 [HeroSection] Periodic refresh of hero settings...');
      loadSettings();
    }, 30000);

    // Cleanup interval and subscription on unmount
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const handlePlatformLink = (platform: string, url?: string) => {
    if (url) {
      // Track external link click (no book ID for hero section links)
      trackExternalLink(platform);
      window.open(url, '_blank');
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/20 dark:from-primary/5 dark:via-transparent dark:to-accent/10" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            initial={{
              x: Math.random() * windowSize.width,
              y: Math.random() * windowSize.height,
            }}
            animate={{
              y: [null, Math.random() * windowSize.height],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-32 w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-5xl md:text-7xl mb-6 leading-tight font-playfair">
              <motion.div
                key={textIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {heroTexts[textIndex] || DEFAULT_HERO_TEXTS[0]}
              </motion.div>
            </div>
            <motion.p 
              key={`paragraph-${textIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg"
            >
              <TypingText text={paragraphTexts[textIndex] || DEFAULT_PARAGRAPH_TEXTS[0]} />
            </motion.p>
            <div className="flex flex-wrap gap-4">
              <div className="relative">
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => setShowPlatforms(!showPlatforms)}
                  className="gap-2"
                >
                  {t('hero.cta')}
                  {siteSettings.platformLinks && siteSettings.platformLinks.length > 0 && (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>

                {/* Platform Links Dropdown */}
                {showPlatforms && siteSettings.platformLinks && siteSettings.platformLinks.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 bg-card border border-border rounded-lg shadow-lg p-2 z-50 min-w-max"
                  >
                    {siteSettings.platformLinks.map((platform, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          handlePlatformLink(platform.name, platform.url);
                          setShowPlatforms(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md hover:bg-secondary transition-colors text-left"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {platform.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Content - Author Portrait */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-accent/30 rounded-3xl blur-3xl" />
              
              {/* Image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src={siteSettings.heroImage || "https://images.unsplash.com/photo-1651427522633-ac5fedf97271?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwd29tYW4lMjBhdXRob3IlMjBwb3J0cmFpdCUyMGNpbmVtYXRpY3xlbnwxfHx8fDE3NzIxMTU4ODN8MA&ixlib=rb-4.1.0&q=80&w=1080"}
                  alt="NENSHA JENNIFER"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
