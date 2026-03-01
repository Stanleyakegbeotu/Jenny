import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Globe, Sparkles, AlertCircle, CheckCircle, Search, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useI18n } from '../../../hooks/useI18n';
import { saveSubscriber } from '../../../lib/supabaseClient';
import { trackSubscribeAttempt, trackSubscribeSuccess } from '../../../lib/analytics';

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia',
  'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium',
  'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei',
  'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Central African Republic',
  'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus',
  'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador',
  'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia',
  'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel',
  'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania',
  'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique',
  'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria',
  'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama',
  'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Republic of the Congo',
  'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines',
  'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles',
  'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa',
  'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland',
  'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago',
  'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom',
  'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen',
  'Zambia', 'Zimbabwe'
];

export function SubscribeSection() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Filter countries based on search input
  const filteredCountries = COUNTRIES.filter((c) =>
    c.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    if (!email || !validateEmail(email)) {
      setErrorMessage(t('subscribe.validationError'));
      setState('error');
      trackSubscribeAttempt(email);
      setTimeout(() => setState('idle'), 3000);
      return;
    }

    // Validate country
    if (!country) {
      setErrorMessage('Please select your country');
      setState('error');
      trackSubscribeAttempt(email);
      setTimeout(() => setState('idle'), 3000);
      return;
    }

    setState('loading');
    setIsCountryDropdownOpen(false);
    trackSubscribeAttempt(email);

    try {
      const result = await saveSubscriber(email, country);

      if (result) {
        setState('success');
        trackSubscribeSuccess(email);
        setEmail('');
        setCountry('');
        setCountrySearch('');
        setErrorMessage('');

        // Reset after 4 seconds (longer to show the enhanced success message)
        setTimeout(() => {
          setState('idle');
        }, 4000);
      } else {
        setErrorMessage(t('subscribe.error'));
        setState('error');
        setTimeout(() => setState('idle'), 3000);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setErrorMessage(t('subscribe.error'));
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-card/80 to-secondary/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-border"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Sparkles className="w-8 h-8 text-[var(--icon-accent)]" />
            </div>
            <h2
              className="text-4xl md:text-5xl mb-4 font-playfair"
            >
              {t('subscribe.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('subscribe.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
            {/* Country Selection with Search */}
            <div className="mb-4" ref={countryDropdownRef}>
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-[var(--icon-info)]" />
                <label className="text-sm font-medium">{t('subscribe.country')} *</label>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsCountryDropdownOpen(!isCountryDropdownOpen);
                    setCountrySearch('');
                  }}
                  disabled={state === 'loading'}
                  className="w-full h-12 bg-background/50 border border-border/50 rounded-lg shadow-md px-3 py-2 text-left flex items-center justify-between hover:bg-background/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className={country ? 'text-foreground' : 'text-muted-foreground'}>
                    {country || t('subscribe.selectCountry')}
                  </span>
                  {country && (
                    <X
                      className="w-4 h-4 text-muted-foreground cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCountry('');
                        setCountrySearch('');
                      }}
                    />
                  )}
                </button>

                {isCountryDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 top-full left-0 right-0 mt-2 bg-card border border-primary/30 rounded-lg shadow-2xl overflow-hidden"
                  >
                    {/* Search input */}
                    <div className="p-3 border-b border-primary/20 bg-background/80">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60" />
                        <input
                          type="text"
                          placeholder="🔍 Search countries..."
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-background border border-primary/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent placeholder:text-muted-foreground"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Countries list */}
                    <div className="max-h-56 overflow-y-auto">
                      {filteredCountries.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No countries found matching "{countrySearch}"
                        </div>
                      ) : (
                        <div className="space-y-0.5 p-1">
                          {filteredCountries.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => {
                                setCountry(c);
                                setIsCountryDropdownOpen(false);
                                setCountrySearch('');
                              }}
                              className={`w-full px-3 py-2.5 text-left text-sm rounded transition-all ${
                                country === c 
                                  ? 'bg-primary/20 font-semibold text-primary border-l-2 border-primary' 
                                  : 'hover:bg-primary/10'
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Email Input */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--icon-primary)]" />
                <Input
                  type="email"
                  placeholder={t('subscribe.email')}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (state === 'error') setState('idle');
                  }}
                  className="pl-10 h-12 bg-background/50 border border-border/50 rounded-lg shadow-md"
                  disabled={state === 'loading'}
                  required
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-12"
                disabled={state === 'loading' || state === 'success'}
              >
                {state === 'loading' && 'Loading...'}
                {state === 'success' && `${t('subscribe.success')} ✓`}
                {state === 'error' && t('subscribe.error')}
                {state === 'idle' && t('subscribe.subscribe')}
              </Button>
            </div>

            {/* Error Message */}
            {state === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mt-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20"
              >
                <AlertCircle className="w-4 h-4 text-[var(--icon-primary)]" />
                <p className="text-sm text-destructive">{errorMessage}</p>
              </motion.div>
            )}

            {/* Success Message */}
            {state === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-4 p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/30 shadow-lg"
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </motion.div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-600 mb-1">{t('subscribe.success')}</h3>
                    <p className="text-sm text-green-600/80 mb-2">
                      Thank you for subscribing! You'll receive updates about new releases and exclusive content.
                    </p>
                    <p className="text-xs text-green-600/70">
                      💡 Want to unsubscribe later? Simply use our Contact form and let us know.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="text-xs text-muted-foreground text-center mt-4 space-y-1">
              <p>{t('subscribe.privacy', "We respect your privacy. Your email will never be shared.")}</p>
              <p className="text-xs text-muted-foreground/80">
                📧 To unsubscribe, simply <a href="#contact" className="underline hover:text-foreground transition-colors">reach out via our Contact form</a>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
