import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, AlertCircle, CheckCircle, Eye, EyeOff, Trash2, Plus, Loader, RotateCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AdminSettings } from './AdminSettings';
import {
  getAuthorSettings as getAuthorSettingsFromDB,
  updateAuthorSettings as updateAuthorSettingsInDB,
  upsertAuthorSettings as upsertAuthorSettingsInDB,
  getNotificationSettings as getNotificationSettingsFromDB,
  updateNotificationSettings as updateNotificationSettingsInDB,
  upsertNotificationSettings as upsertNotificationSettingsInDB,
  AuthorSettings as DBAuthorSettings,
  NotificationSettings as DBNotificationSettings,
} from '../../../lib/siteSettings';
import {
  getTotalReadsCount,
  getTotalBooksPublished,
  getTotalSubscribersCount,
} from '../../../lib/supabaseClient';

interface Review {
  id: string;
  quote: string;
  author: string;
  platform: string;
  rating: number;
}

interface PlatformLink {
  name: string;
  url: string;
}

interface AuthorSettings {
  id?: string;
  name: string;
  bio: string;
  email: string;
  profileImage?: string;
  totalReads: number;
  booksPublished: number;
  subscribers: number;
  instagramUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  reviews: Review[];
}

interface SiteSettings {
  siteTitle: string;
  siteTagline: string;
  supportEmail: string;
  heroImage?: string;
  platformLinks?: PlatformLink[];
}

interface NotificationSettings {
  id?: string;
  notifyNewSubscribers: boolean;
  notifyContactForm: boolean;
  notifyBookViews: boolean;
}

export function SettingsPage() {
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<'author' | 'reviews' | 'hero' | 'site' | 'notifications' | 'formspree'>('author');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Author Settings
  const [authorSettings, setAuthorSettings] = useState<AuthorSettings>({
    name: 'Jennifer Nensha',
    bio: 'Romance author crafting tales of love and passion.',
    email: 'contact@jennifernens.com',
    totalReads: 0,
    booksPublished: 0,
    subscribers: 0,
    instagramUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
    reviews: [],
  });

  // Site Settings
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteTitle: 'Nensha Jennifer - Romance Author',
    siteTagline: 'Discover captivating romance stories from acclaimed author Jennifer Nensha',
    supportEmail: 'support@jennifernens.com',
    heroImage: '',
    platformLinks: [],
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    notifyNewSubscribers: true,
    notifyContactForm: true,
    notifyBookViews: false,
  });

  // Load settings from Supabase
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [author, notifications] = await Promise.all([
          getAuthorSettingsFromDB(),
          getNotificationSettingsFromDB(),
        ]);

        if (author) {
          setAuthorSettings({
            id: author.id,
            name: author.name || '',
            bio: author.bio || '',
            email: author.email || '',
            profileImage: author.profileImage,
            totalReads: author.totalReads || 0,
            booksPublished: author.booksPublished || 0,
            subscribers: author.subscribers || 0,
            instagramUrl: author.instagramUrl,
            twitterUrl: author.twitterUrl,
            linkedinUrl: author.linkedinUrl,
            reviews: author.reviews || [],
          });
        }

        if (notifications) {
          setNotificationSettings({
            id: notifications.id,
            notifyNewSubscribers: notifications.notifyNewSubscribers,
            notifyContactForm: notifications.notifyContactForm,
            notifyBookViews: notifications.notifyBookViews,
          });
        }
      } catch (err) {
        console.error('Error loading settings from Supabase:', err);
      }
    };

    loadSettings();
  }, []);

  // Load auto-calculated stats from database
  const loadAuthorStats = async () => {
    setIsLoadingStats(true);
    try {
      const [reads, books, subs] = await Promise.all([
        getTotalReadsCount(),
        getTotalBooksPublished(),
        getTotalSubscribersCount(),
      ]);

      setAuthorSettings((prev) => ({
        ...prev,
        totalReads: reads,
        booksPublished: books,
        subscribers: subs,
      }));

      console.log('✅ Author stats refreshed from database:', { reads, books, subscribers: subs });
    } catch (err) {
      console.error('Error loading author stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaveState('saving');
    try {
      // Upsert author and notification settings to Supabase (insert if missing)
      const authorResult = await upsertAuthorSettingsInDB(authorSettings as unknown as DBAuthorSettings);
      const notificationResult = await upsertNotificationSettingsInDB(
        notificationSettings as unknown as DBNotificationSettings
      );

      if (authorResult && notificationResult) {
        console.log('✅ Settings upserted to Supabase successfully');
        setSaveState('success');
        setTimeout(() => setSaveState('idle'), 3000);
      } else {
        throw new Error('Failed to save one or more settings');
      }
    } catch (err) {
      console.error('❌ Error saving settings:', err);
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 3000);
    }
  };

  const tabs = [
    { id: 'author', label: 'Author Profile', icon: '👤' },
    { id: 'reviews', label: 'Reader Reviews', icon: '⭐' },
    { id: 'hero', label: 'Hero & Platforms', icon: '🚀' },
    { id: 'site', label: 'Site Settings', icon: '🌐' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'formspree', label: 'Contact Form', icon: '📮' },
  ];

  return (
    <div className="space-y-6 pb-32">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl mb-2 font-playfair truncate">Settings</h1>
        <p className="text-muted-foreground text-sm md:text-base">Configure your author platform and preferences.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-border overflow-x-auto pb-0 mb-6 justify-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-2 sm:px-4 py-3 whitespace-nowrap font-medium transition-colors border-b-2 text-xs sm:text-sm ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Status Messages */}
      {saveState === 'success' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20"
        >
          <CheckCircle className="w-4 h-4 text-green-500" />
          <p className="text-sm text-green-500">Settings saved successfully!</p>
        </motion.div>
      )}

      {saveState === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20"
        >
          <AlertCircle className="w-4 h-4 text-destructive" />
          <p className="text-sm text-destructive">Error saving settings. Please try again.</p>
        </motion.div>
      )}

      {/* Author Profile Settings */}
      {activeTab === 'author' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Profile Image */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {authorSettings.profileImage && (
                  <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-border">
                    <img src={authorSettings.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">Upload Profile Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setAuthorSettings({
                            ...authorSettings,
                            profileImage: event.target?.result as string,
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    title="Upload profile image"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Author Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Author Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Author Name *</label>
                <Input
                  value={authorSettings.name}
                  onChange={(e) => setAuthorSettings({ ...authorSettings, name: e.target.value })}
                  placeholder="Your full name"
                  className="bg-background/50 border border-border/50 rounded-lg shadow-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">About Author / Bio *</label>
                <Textarea
                  value={authorSettings.bio}
                  onChange={(e) => setAuthorSettings({ ...authorSettings, bio: e.target.value })}
                  placeholder="Write a brief bio about yourself"
                  className="bg-background/50 border border-border/50 rounded-lg shadow-md min-h-[100px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email Address *</label>
                <Input
                  type="email"
                  value={authorSettings.email}
                  onChange={(e) => setAuthorSettings({ ...authorSettings, email: e.target.value })}
                  placeholder="your.email@example.com"
                  className="bg-background/50 border border-border/50 rounded-lg shadow-md"
                />
              </div>

              {/* Author Statistics */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Author Statistics</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadAuthorStats}
                    disabled={isLoadingStats}
                    className="gap-2"
                  >
                    <RotateCw className={`w-4 h-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
                    {isLoadingStats ? 'Loading...' : 'Refresh from Database'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 These values are automatically calculated from your database. Click "Refresh" to update them. You can also manually override any value below.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 p-6 bg-secondary/30 rounded-lg border border-border">
                  <div>
                    <label className="block text-sm font-medium mb-2">Total Reads</label>
                    <p className="text-xs text-muted-foreground mb-2">Auto-calculated from books</p>
                    <Input
                      type="number"
                      value={authorSettings.totalReads}
                      onChange={(e) => setAuthorSettings({ ...authorSettings, totalReads: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className="bg-background/50 border border-border/50 rounded-lg shadow-md"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Books Published</label>
                    <p className="text-xs text-muted-foreground mb-2">Auto-calculated from books table</p>
                    <Input
                      type="number"
                      value={authorSettings.booksPublished}
                      onChange={(e) => setAuthorSettings({ ...authorSettings, booksPublished: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className="bg-background/50 border border-border/50 rounded-lg shadow-md"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Subscribers</label>
                    <p className="text-xs text-muted-foreground mb-2">Auto-calculated from subscribers</p>
                    <Input
                      type="number"
                      value={authorSettings.subscribers}
                      onChange={(e) => setAuthorSettings({ ...authorSettings, subscribers: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className="bg-background/50 border border-border/50 rounded-lg shadow-md"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Instagram URL</label>
                  <Input
                    value={authorSettings.instagramUrl || ''}
                    onChange={(e) => setAuthorSettings({ ...authorSettings, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/..."
                    className="bg-background/50 border border-border/50 rounded-lg shadow-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Twitter URL</label>
                  <Input
                    value={authorSettings.twitterUrl || ''}
                    onChange={(e) => setAuthorSettings({ ...authorSettings, twitterUrl: e.target.value })}
                    placeholder="https://twitter.com/..."
                    className="bg-background/50 border border-border/50 rounded-lg shadow-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">LinkedIn URL</label>
                  <Input
                    value={authorSettings.linkedinUrl || ''}
                    onChange={(e) => setAuthorSettings({ ...authorSettings, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/..."
                    className="bg-background/50 border border-border/50 rounded-lg shadow-md"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Reader Reviews Management */}
      {activeTab === 'reviews' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Manage Reader Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add New Review Form */}
              <div className="p-6 bg-secondary/30 rounded-lg border border-border space-y-4">
                <h3 className="font-semibold text-lg">Add New Review</h3>
                <ReviewForm
                  onSubmit={async (review) => {
                    const newReview: Review = {
                      id: Date.now().toString(),
                      ...review,
                    };
                    const updatedReviews = [...(authorSettings.reviews || []), newReview];
                    const updatedSettings = {
                      ...authorSettings,
                      reviews: updatedReviews,
                    };
                    setAuthorSettings(updatedSettings);
                    
                    // Save immediately to Supabase
                    try {
                      const result = await upsertAuthorSettingsInDB(updatedSettings as unknown as DBAuthorSettings);
                      if (result) {
                        console.log('✅ Review added and saved to Supabase');
                      }
                    } catch (err) {
                      console.error('Error adding review:', err);
                    }
                  }}
                />
              </div>

              {/* Existing Reviews */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Current Reviews ({authorSettings.reviews?.length || 0})</h3>
                {authorSettings.reviews && authorSettings.reviews.length > 0 ? (
                  <div className="max-h-[400px] overflow-y-auto border border-border rounded-lg p-4 bg-card/50 space-y-4">
                    {authorSettings.reviews.map((review) => (
                      <div key={review.id} className="p-4 bg-card border border-border rounded-lg space-y-3">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex gap-1 mb-2">
                              {[...Array(review.rating)].map((_, i) => (
                                <span key={i}>⭐</span>
                              ))}
                            </div>
                            <p className="italic text-foreground mb-2 break-words whitespace-pre-wrap">"{review.quote}"</p>
                            <div className="flex gap-4 text-sm flex-wrap">
                              <span className="font-medium">{review.author}</span>
                              <span className="text-muted-foreground">{review.platform}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              // Remove review from local state
                              const updatedReviews = authorSettings.reviews?.filter(r => r.id !== review.id) || [];
                              const updatedSettings = {
                                ...authorSettings,
                                reviews: updatedReviews,
                              };
                              setAuthorSettings(updatedSettings);
                              
                              // Save immediately to Supabase
                              try {
                                const result = await upsertAuthorSettingsInDB(updatedSettings as unknown as DBAuthorSettings);
                                if (result) {
                                  console.log('✅ Review deleted and saved to Supabase');
                                }
                              } catch (err) {
                                console.error('Error deleting review:', err);
                              }
                            }}
                            className="text-destructive hover:bg-destructive/10 shrink-0"
                            title="Delete review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No reviews yet. Add your first review above!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Hero Section & Platform Links */}
      {activeTab === 'hero' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Hero Image */}
          <Card>
            <CardHeader>
              <CardTitle>Hero Section Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {siteSettings.heroImage && (
                <div className="w-full max-w-md rounded-lg overflow-hidden border border-border">
                  <img src={siteSettings.heroImage} alt="Hero" className="w-full h-auto object-cover" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2">Upload Hero Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setSiteSettings({
                          ...siteSettings,
                          heroImage: event.target?.result as string,
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  title="Upload hero image"
                />
                <p className="text-xs text-muted-foreground mt-2">Recommended size: 1080x1080px or larger</p>
              </div>
            </CardContent>
          </Card>

          {/* Book Platform Links */}
          <Card>
            <CardHeader>
              <CardTitle>Book Hosting Platform Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Add links to your book profiles on different platforms. Readers can choose which platform to visit when they click "Explore Books".
              </p>

              {/* Current Links */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Current Platform Links</h3>
                {siteSettings.platformLinks && siteSettings.platformLinks.length > 0 ? (
                  <div className="space-y-3">
                    {siteSettings.platformLinks.map((link, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border">
                        <div className="flex-1">
                          <div className="font-medium">{link.name}</div>
                          <div className="text-sm text-muted-foreground truncate">{link.url}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSiteSettings({
                              ...siteSettings,
                              platformLinks: (siteSettings.platformLinks || []).filter((_, i) => i !== index),
                            });
                          }}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No platform links yet. Add one below!</p>
                )}
              </div>

              {/* Add New Link Form */}
              <PlatformLinkForm
                onSubmit={(platform) => {
                  setSiteSettings({
                    ...siteSettings,
                    platformLinks: [...(siteSettings.platformLinks || []), platform],
                  });
                }}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Site Settings */}
      {activeTab === 'site' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Site Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Site Title *</label>
                <Input
                  value={siteSettings.siteTitle}
                  onChange={(e) => setSiteSettings({ ...siteSettings, siteTitle: e.target.value })}
                  placeholder="Your site title"
                  className="bg-background/50"
                />
                <p className="text-xs text-muted-foreground mt-1">This appears in browser tabs and search results</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Site Tagline / Description *</label>
                <Textarea
                  value={siteSettings.siteTagline}
                  onChange={(e) => setSiteSettings({ ...siteSettings, siteTagline: e.target.value })}
                  placeholder="Brief description of your site"
                  className="bg-background/50 min-h-[80px]"
                />
                <p className="text-xs text-muted-foreground mt-1">Displayed on the landing page and in SEO metadata</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Support Email Address *</label>
                <Input
                  type="email"
                  value={siteSettings.supportEmail}
                  onChange={(e) => setSiteSettings({ ...siteSettings, supportEmail: e.target.value })}
                  placeholder="support@example.com"
                  className="bg-background/50"
                />
                <p className="text-xs text-muted-foreground mt-1">Used for contact form and support communications</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Email Configuration */}
      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-lg border border-accent/20">
                <input
                  type="checkbox"
                  id="notify-subscribers"
                  checked={notificationSettings.notifyNewSubscribers}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, notifyNewSubscribers: e.target.checked })}
                  className="rounded"
                />
                <div className="flex-1">
                  <label htmlFor="notify-subscribers" className="text-sm font-medium cursor-pointer block">
                    Email me on New Subscribers
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">Receive an email whenever someone subscribes</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-lg border border-accent/20">
                <input
                  type="checkbox"
                  id="notify-contact"
                  checked={notificationSettings.notifyContactForm}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, notifyContactForm: e.target.checked })}
                  className="rounded"
                />
                <div className="flex-1">
                  <label htmlFor="notify-contact" className="text-sm font-medium cursor-pointer block">
                    Email me on Contact Form Submissions
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">Receive an email whenever someone fills out the contact form</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-lg border border-accent/20">
                <input
                  type="checkbox"
                  id="notify-views"
                  checked={notificationSettings.notifyBookViews}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, notifyBookViews: e.target.checked })}
                  className="rounded"
                />
                <div className="flex-1">
                  <label htmlFor="notify-views" className="text-sm font-medium cursor-pointer block">
                    Email me on Book Previews
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">Receive daily digest of book previews and interactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Formspree Contact Form Settings */}
      {activeTab === 'formspree' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <AdminSettings />
        </motion.div>
      )}

      {/* Save Button - Fixed at bottom */}
      <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border p-6 flex justify-end gap-3 z-50">
        <Button 
          variant="outline"
          onClick={() => setActiveTab('author')}
        >
          Cancel
        </Button>
        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90 gap-2 px-6"
          onClick={handleSaveSettings}
          disabled={saveState === 'saving' || saveState === 'success'}
        >
          <Save className="w-4 h-4" />
          {saveState === 'saving' ? 'Saving...' : saveState === 'success' ? 'Saved!' : 'Save All Changes'}
        </Button>
      </div>
    </div>
  );
}

// Review Form Component
function ReviewForm({ onSubmit }: { onSubmit: (review: Omit<Review, 'id'>) => void }) {
  const [formData, setFormData] = useState({
    quote: '',
    author: '',
    platform: '',
    rating: 5,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.quote && formData.author && formData.platform) {
      onSubmit({
        quote: formData.quote,
        author: formData.author,
        platform: formData.platform,
        rating: formData.rating,
      });
      setFormData({ quote: '', author: '', platform: '', rating: 5 });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Review Quote *</label>
        <Textarea
          value={formData.quote}
          onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
          placeholder="What did the reader say about your book?"
          className="bg-background/50 border border-border/50 rounded-lg shadow-md min-h-[80px]"
          required
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Reviewer Name *</label>
          <Input
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            placeholder="e.g., Sarah M."
            className="bg-background/50 border border-border/50 rounded-lg shadow-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Platform *</label>
          <select
            value={formData.platform}
            onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
            className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg shadow-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            title="Select review platform"
            aria-label="Review platform"
            required
          >
            <option value="">Select platform</option>
            <option value="Inkitt Reader">Inkitt Reader</option>
            <option value="Wattpad Reader">Wattpad Reader</option>
            <option value="Amazon Reader">Amazon Reader</option>
            <option value="Goodreads Reviewer">Goodreads Reviewer</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Rating</label>
          <select
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
            className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg shadow-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            title="Select review rating"
            aria-label="Review rating"
          >
            <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
            <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
            <option value="3">⭐⭐⭐ (3 Stars)</option>
            <option value="2">⭐⭐ (2 Stars)</option>
            <option value="1">⭐ (1 Star)</option>
          </select>
        </div>
      </div>

      <Button type="submit" className="bg-primary hover:bg-primary/90 gap-2 w-full md:w-auto">
        <Plus className="w-4 h-4" />
        Add Review
      </Button>
    </form>
  );
}

// Platform Link Form Component
function PlatformLinkForm({ onSubmit }: { onSubmit: (platform: PlatformLink) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
  });

  const predefinedPlatforms = [
    'Inkitt',
    'Wattpad',
    'Amazon KDP',
    'Goodreads',
    'Apple Books',
    'Google Play Books',
    'Smashwords',
    'Draft2Digital',
    'Other',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.url) {
      onSubmit({
        name: formData.name,
        url: formData.url,
      });
      setFormData({ name: '', url: '' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-secondary/30 rounded-lg border border-border space-y-4">
      <h3 className="font-semibold text-lg">Add New Platform Link</h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Platform Name *</label>
          <select
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg shadow-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            title="Select or enter platform name"
            aria-label="Platform name"
            required
          >
            <option value="">Select platform</option>
            {predefinedPlatforms.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Profile URL *</label>
          <Input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://..."
            className="bg-background/50 border border-border/50 rounded-lg shadow-md"
            required
          />
        </div>
      </div>

      <Button type="submit" className="bg-primary hover:bg-primary/90 gap-2">
        <Plus className="w-4 h-4" />
        Add Platform
      </Button>
    </form>
  );
}
