import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Users, Heart } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useI18n } from '../../../hooks/useI18n';
import { getAuthorSettings as getAuthorSettingsFromDB } from '../../../lib/siteSettings';
import { subscribeToPublish } from '../../../lib/publishManager';

interface AuthorSettings {
  name: string;
  bio: string;
  profileImage?: string;
  totalReads: number;
  booksPublished: number;
  subscribers: number;
}

export function AboutSection() {
  const { t } = useI18n();
  const [authorSettings, setAuthorSettings] = useState<AuthorSettings | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        console.log('🔄 [AboutSection] Fetching author settings from database...');
        const settings = await getAuthorSettingsFromDB();
        if (settings) {
          console.log('✅ [AboutSection] Settings loaded:', settings.name);
          setAuthorSettings({
            name: settings.name || 'NENSHA JENNIFER',
            bio: settings.bio || '',
            profileImage: settings.profileImage,
            totalReads: settings.totalReads || 0,
            booksPublished: settings.booksPublished || 0,
            subscribers: settings.subscribers || 0,
          });
        } else {
          // Set default if no settings found
          setAuthorSettings({
            name: 'NENSHA JENNIFER',
            bio: '',
            totalReads: 0,
            booksPublished: 0,
            subscribers: 0,
          });
        }
      } catch (error) {
        console.error('❌ [AboutSection] Error loading author settings:', error);
        // Set default values on error
        setAuthorSettings({
          name: 'NENSHA JENNIFER',
          bio: '',
          totalReads: 0,
          booksPublished: 0,
          subscribers: 0,
        });
      }
    };

    // Load settings immediately
    loadSettings();

    // Subscribe to publish events for instant updates
    const unsubscribe = subscribeToPublish((event) => {
      if (event.type === 'full-refresh') {
        console.log('📢 [AboutSection] Received publish event, refreshing author settings...');
        loadSettings();
      }
    });

    // Refresh settings every 30 seconds so visitors see admin updates in real-time
    const interval = setInterval(() => {
      console.log('🔄 [AboutSection] Periodic refresh of author settings...');
      loadSettings();
    }, 30000);

    // Cleanup interval and subscription on unmount
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace('.0', '') + 'M+';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1).replace('.0', '') + 'K+';
    }
    return num.toString();
  };

  const stats = [
    { icon: BookOpen, label: t('about.totalReads', 'Total Reads'), value: formatNumber(authorSettings?.totalReads || 0) },
    { icon: Heart, label: t('about.booksPublished', 'Books Published'), value: authorSettings?.booksPublished || 0 },
    { icon: Users, label: t('about.subscribers', 'Subscribers'), value: formatNumber(authorSettings?.subscribers || 0) },
  ];

  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src={authorSettings?.profileImage || '/assets/images/author/avt.png'}
                alt={authorSettings?.name || 'Author'}
                className="w-full h-auto object-cover"
              />
            </div>
            
            {/* Decorative element */}
            <div className="absolute -z-10 top-8 -left-8 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute -z-10 bottom-8 -right-8 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl mb-6 font-playfair">
              {t('about.authorTitle', 'About the Author')}
            </h2>
            
            <div className="space-y-4 text-muted-foreground leading-relaxed mb-8">
              {authorSettings?.bio && (
                <p>{authorSettings.bio}</p>
              )}
              {!authorSettings?.bio && (
                <>
                  <p>
                    {authorSettings?.name || 'NENSHA JENNIFER'} is an internationally acclaimed romance author whose stories have
                    captivated millions of readers across the globe. With a gift for crafting deeply
                    emotional narratives, she weaves tales of love, passion, and redemption that
                    resonate with readers of all backgrounds.
                  </p>
                  <p>
                    Her writing journey began with a simple belief: that love, in all its forms, is the
                    most powerful force in the universe. This philosophy shines through in every story
                    she tells, creating characters and relationships that feel authentic, raw, and
                    beautifully human.
                  </p>
                  <p>
                    When she's not writing, she enjoys traveling to new destinations for inspiration,
                    spending time with her family, and connecting with her incredible community of
                    readers who have become like family.
                  </p>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
