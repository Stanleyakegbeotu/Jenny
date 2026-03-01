import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Send, Users, BarChart3, Settings, Plus, Trash2, Edit2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { fetchSubscribers } from '../../../lib/supabaseClient';
import { sendNewsletterEmail } from '../../../lib/email';

interface NewsletterCampaign {
  id: string;
  title: string;
  subject: string;
  status: 'draft' | 'scheduled' | 'sent';
  recipients: number;
  sent_count: number;
  created_at: string;
  sent_at?: string;
}

interface EmailStats {
  total_emails_sent: number;
  total_subscribers: number;
  active_subscribers: number;
  unsubscribed_count: number;
  bounce_rate: number;
}

export function EmailManagement() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'campaigns' | 'subscribers' | 'templates'>('dashboard');
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Newsletter form state
  const [newsletterForm, setNewsletterForm] = useState({
    title: '',
    subject: '',
    content: '',
    ctaUrl: '',
    ctaText: '',
  });

  useEffect(() => {
    loadEmailDashboard();
  }, []);

  const loadEmailDashboard = async () => {
    try {
      setLoading(true);
      const subscribers = await fetchSubscribers();
      
      const activeSubscribers = subscribers.filter(s => !s.unsubscribed_at);
      const unsubscribedCount = subscribers.filter(s => s.unsubscribed_at).length;

      setStats({
        total_emails_sent: 0, // Would fetch from email_logs table
        total_subscribers: subscribers.length,
        active_subscribers: activeSubscribers.length,
        unsubscribed_count: unsubscribedCount,
        bounce_rate: 0, // Would calculate from email_logs
      });
    } catch (error) {
      console.error('Error loading email dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterForm.title || !newsletterForm.subject || !newsletterForm.content) {
      alert('Please fill out all required fields');
      return;
    }

    try {
      setLoading(true);
      const subscribers = await fetchSubscribers();
      const activeSubscribers = subscribers.filter(s => !s.unsubscribed_at);

      let successCount = 0;
      for (const subscriber of activeSubscribers) {
        const sent = await sendNewsletterEmail(
          subscriber.email,
          newsletterForm.subject,
          newsletterForm.content,
          newsletterForm.ctaUrl || undefined,
          newsletterForm.ctaText || 'Read More'
        );
        if (sent) successCount++;
      }

      alert(`✅ Newsletter sent to ${successCount} subscribers`);
      setNewsletterForm({ title: '', subject: '', content: '', ctaUrl: '', ctaText: '' });
      loadEmailDashboard();
    } catch (error) {
      console.error('Error sending newsletter:', error);
      alert('❌ Failed to send newsletter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2 font-playfair">📧 Email Management</h1>
        <p className="text-muted-foreground">Manage newsletters, campaigns, and email settings</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border">
        {(['dashboard', 'campaigns', 'subscribers', 'templates'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'dashboard' && '📊 Dashboard'}
            {tab === 'campaigns' && '📩 Campaigns'}
            {tab === 'subscribers' && '👥 Subscribers'}
            {tab === 'templates' && '📝 Templates'}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Subscribers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_subscribers}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stats.active_subscribers} active</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Emails Sent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_emails_sent}</div>
                  <p className="text-xs text-muted-foreground mt-1">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Unsubscribed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.unsubscribed_count}</div>
                  <p className="text-xs text-muted-foreground mt-1">{((stats.unsubscribed_count / stats.total_subscribers) * 100).toFixed(1)}% rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Bounce Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.bounce_rate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Send Newsletter Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Send New Newsletter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendNewsletter} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Campaign Title</label>
                  <Input
                    placeholder="e.g., March 2024 Book Release"
                    value={newsletterForm.title}
                    onChange={(e) => setNewsletterForm({ ...newsletterForm, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email Subject</label>
                  <Input
                    placeholder="e.g., 🎉 Check Out Our Latest Release"
                    value={newsletterForm.subject}
                    onChange={(e) => setNewsletterForm({ ...newsletterForm, subject: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Content</label>
                  <Textarea
                    placeholder="Your newsletter content..."
                    rows={6}
                    value={newsletterForm.content}
                    onChange={(e) => setNewsletterForm({ ...newsletterForm, content: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">CTA URL (Optional)</label>
                    <Input
                      placeholder="https://..."
                      value={newsletterForm.ctaUrl}
                      onChange={(e) => setNewsletterForm({ ...newsletterForm, ctaUrl: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">CTA Text</label>
                    <Input
                      placeholder="e.g., Read More"
                      value={newsletterForm.ctaText}
                      onChange={(e) => setNewsletterForm({ ...newsletterForm, ctaText: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={loading}>
                    <Send className="w-4 h-4 mr-2" />
                    {loading ? 'Sending...' : `Send to ${stats?.active_subscribers || 0} Subscribers`}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <Card>
          <CardHeader>
            <CardTitle>Newsletter Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            {campaigns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No campaigns yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.title}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status}
                        </span>
                      </TableCell>
                      <TableCell>{campaign.sent_count}/{campaign.recipients}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Subscribers Tab */}
      {activeTab === 'subscribers' && (
        <Card>
          <CardHeader>
            <CardTitle>Subscriber Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Subscriber management coming soon</p>
              <p className="text-sm mt-2">Export, filter, and manage subscribers here</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <Card>
          <CardHeader>
            <CardTitle>Email Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Template management coming soon</p>
              <p className="text-sm mt-2">Customize email templates here</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
