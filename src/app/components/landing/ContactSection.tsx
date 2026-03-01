import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Briefcase, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useI18n } from '../../../hooks/useI18n';
import { saveContactMessage } from '../../../lib/supabaseClient';
import { trackContactSubmit } from '../../../lib/analytics';
import { getFormspreeUrl } from '../../../lib/siteSettings';

export function ContactSection() {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [formspreeUrl, setFormspreeUrl] = useState<string | null>(null);

  // Load Formspree URL on component mount
  useEffect(() => {
    const loadFormspreeUrl = async () => {
      try {
        const url = await getFormspreeUrl();
        setFormspreeUrl(url);
        if (!url) {
          console.warn('Formspree URL not configured in site settings');
        }
      } catch (err) {
        console.error('Error loading Formspree URL:', err);
      }
    };

    loadFormspreeUrl();
  }, []);

  const validateForm = (): boolean => {
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMessage(t('contact.validationError'));
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage(t('contact.validationError'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setState('error');
      setTimeout(() => setState('idle'), 3000);
      return;
    }

    if (!formspreeUrl) {
      setErrorMessage(t('contact.error'));
      setState('error');
      setTimeout(() => setState('idle'), 3000);
      console.error('Formspree URL not configured');
      return;
    }

    setState('loading');
    trackContactSubmit(formData.email);

    try {
      // Save to Supabase for admin records
      const saveToDb = saveContactMessage(
        formData.name,
        formData.email,
        formData.message
      );

      // Submit to Formspree
      const submitToFormspree = fetch(formspreeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });

      // Wait for both to complete
      const [dbResult] = await Promise.all([saveToDb, submitToFormspree]);

      if (dbResult) {
        setState('success');
        setFormData({ name: '', email: '', message: '' });
        setErrorMessage('');

        // Reset after 3 seconds
        setTimeout(() => {
          setState('idle');
        }, 3000);
      } else {
        setErrorMessage(t('contact.error'));
        setState('error');
        setTimeout(() => setState('idle'), 3000);
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setErrorMessage(t('contact.error'));
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  };

  return (
    <section id="contact" className="py-24 bg-secondary/30">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2
            className="text-4xl md:text-5xl mb-4 font-playfair"
          >
            {t('contact.title')}
          </h2>
          <p className="text-lg text-muted-foreground mb-2">
            {t('contact.subtitle')}
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-primary mt-2">
            <Briefcase className="w-4 h-4" />
            <span>{t('contact.businessInquiries', 'For business and collaboration inquiries')}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <form
            onSubmit={handleSubmit}
            className="bg-card rounded-2xl p-8 shadow-lg border border-border space-y-6"
          >
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm mb-2 text-foreground">
                  {t('contact.name')}
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t('contact.name')}
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (state === 'error') setState('idle');
                  }}
                  className="bg-background/50 border border-border/50 rounded-lg shadow-md"
                  disabled={state === 'loading'}
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm mb-2 text-foreground">
                  {t('contact.email')}
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('contact.email')}
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (state === 'error') setState('idle');
                  }}
                  className="bg-background/50 border border-border/50 rounded-lg shadow-md"
                  disabled={state === 'loading'}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm mb-2 text-foreground">
                {t('contact.message')}
              </label>
              <Textarea
                id="message"
                placeholder={t('contact.message')}
                value={formData.message}
                onChange={(e) => {
                  setFormData({ ...formData, message: e.target.value });
                  if (state === 'error') setState('idle');
                }}
                className="bg-background/50 border border-border/50 rounded-lg shadow-md min-h-[150px]"
                disabled={state === 'loading'}
                required
              />
            </div>

            {/* Error Message */}
            {state === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20"
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
                className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20"
              >
                <CheckCircle className="w-4 h-4 text-[var(--icon-success)]" />
                <p className="text-sm text-green-500">{t('contact.success')}</p>
              </motion.div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={state === 'loading' || state === 'success'}
            >
              {state === 'loading' && t('common.loading')}
              {state === 'success' && `${t('contact.success')} ✓`}
              {state === 'error' && t('contact.error')}
              {state === 'idle' && (
                <>
                  <Send className="w-5 h-5 mr-2 text-[var(--icon-primary)]" />
                  {t('contact.send')}
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
