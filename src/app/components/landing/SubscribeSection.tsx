import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Globe, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
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
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

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
    trackSubscribeAttempt(email);

    try {
      const result = await saveSubscriber(email, country);

      if (result) {
        setState('success');
        trackSubscribeSuccess(email);
        setEmail('');
        setCountry('');
        setErrorMessage('');

        // Reset after 3 seconds
        setTimeout(() => {
          setState('idle');
        }, 3000);
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
            {/* Country Selection */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-[var(--icon-info)]" />
                <label className="text-sm font-medium">{t('subscribe.country')} *</label>
              </div>
              <Select value={country} onValueChange={setCountry} disabled={state === 'loading'}>
                <SelectTrigger className="h-12 bg-background/50 border border-border/50 rounded-lg shadow-md">
                  <SelectValue placeholder={t('subscribe.selectCountry')} />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mt-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20"
              >
                <CheckCircle className="w-4 h-4 text-[var(--icon-success)]" />
                <p className="text-sm text-green-500">{t('subscribe.success')}</p>
              </motion.div>
            )}

            <p className="text-xs text-muted-foreground text-center mt-4">
              {t('subscribe.privacy', "We respect your privacy. Unsubscribe at any time.")}
            </p>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
