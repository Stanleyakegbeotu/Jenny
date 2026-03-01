import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, CheckCircle, AlertCircle, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { updateFormspreeUrl, getFormspreeUrl } from '../../../lib/siteSettings';

export function AdminSettings() {
  const [formspreeUrl, setFormspreeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; text: string }>({
    type: null,
    text: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const url = await getFormspreeUrl();
      setFormspreeUrl(url || '');
    } catch (err) {
      console.error('Error loading settings:', err);
      setStatus({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus({ type: null, text: '' });

    try {
      if (formspreeUrl && !formspreeUrl.startsWith('https://formspree.io/')) {
        setStatus({
          type: 'error',
          text: 'Invalid Formspree URL. Must start with https://formspree.io/',
        });
        setSaving(false);
        return;
      }

      const success = await updateFormspreeUrl(formspreeUrl);

      if (success) {
        setStatus({ type: 'success', text: 'Formspree URL saved successfully!' });
        setTimeout(() => setStatus({ type: null, text: '' }), 3000);
      } else {
        setStatus({ type: 'error', text: 'Failed to save URL' });
      }
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = () => {
    if (formspreeUrl) {
      navigator.clipboard.writeText(formspreeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <Card className="border-primary/10">
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Loading settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/10 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardTitle className="flex items-center gap-2">
          <span>📮</span>
          Formspree Contact Form
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-8">
        <div className="space-y-5">
          {/* Input Section */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground">
              Formspree Endpoint URL
            </label>
            <div className="relative flex gap-2">
              <Input
                type="url"
                placeholder="https://formspree.io/f/your-form-id"
                value={formspreeUrl}
                onChange={(e) => setFormspreeUrl(e.target.value)}
                className="font-mono text-sm pr-10 bg-background/50"
              />
              {formspreeUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Get your endpoint from{' '}
              <a
                href="https://formspree.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                formspree.io
              </a>
              {' → '}create form{' → '}copy endpoint URL
            </p>
          </div>

          {/* Status Messages */}
          {status.type && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex items-center gap-2 p-3 rounded-lg border ${
                status.type === 'success'
                  ? 'bg-green-500/10 border-green-500/30 text-green-700'
                  : 'bg-destructive/10 border-destructive/30 text-destructive'
              }`}
            >
              {status.type === 'success' ? (
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <p className="text-sm font-medium">{status.text}</p>
            </motion.div>
          )}

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={saving || !formspreeUrl}
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Formspree URL'}
          </Button>

          {/* Status Indicator */}
          {formspreeUrl && (
            <div className="text-xs text-muted-foreground p-2 rounded bg-secondary/30">
              ✓ URL configured • Contact form is active
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
