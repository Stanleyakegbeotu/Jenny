import { useState, useEffect } from 'react';
import { Download, Search, Mail, Send, X, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { fetchSubscribers, Subscriber, sendBulkEmail, deleteSubscriber } from '../../../lib/supabaseClient';
import { motion } from 'motion/react';

export function SubscribersManagement() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] = useState<Subscriber | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    try {
      setLoading(true);
      const data = await fetchSubscribers();
      setSubscribers(data);
    } catch (err) {
      console.error('Error loading subscribers:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscribers = subscribers.filter((sub) =>
    sub.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    if (subscribers.length === 0) {
      alert('No subscribers to export');
      return;
    }

    const csv = [
      ['Email', 'Subscribed Date', 'Status'],
      ...subscribers.map((sub) => [
        sub.email,
        new Date(sub.subscribed_at).toLocaleDateString(),
        sub.is_active !== false ? 'Active' : 'Unsubscribed',
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim()) {
      setSendError('Email subject is required');
      return;
    }

    if (!emailMessage.trim()) {
      setSendError('Email message is required');
      return;
    }

    if (subscribers.length === 0) {
      setSendError('No active subscribers to send to');
      return;
    }

    setIsSending(true);
    setSendError(null);

    try {
      const activeSubscribers = subscribers.filter((sub) => sub.is_active !== false);
      
      if (activeSubscribers.length === 0) {
        setSendError('No active subscribers to send to');
        setIsSending(false);
        return;
      }

      const success = await sendBulkEmail(
        activeSubscribers.map((s) => s.email),
        emailSubject,
        emailMessage
      );

      if (success) {
        setSendSuccess(true);
        setEmailSubject('');
        setEmailMessage('');
        setTimeout(() => {
          setIsEmailModalOpen(false);
          setSendSuccess(false);
        }, 2000);
      } else {
        setSendError('Failed to send emails. Please try again.');
      }
    } catch (err) {
      console.error('Error sending emails:', err);
      setSendError(err instanceof Error ? err.message : 'Failed to send emails');
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteClick = (subscriber: Subscriber) => {
    setSubscriberToDelete(subscriber);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!subscriberToDelete) return;

    setIsDeleting(true);
    try {
      const success = await deleteSubscriber(subscriberToDelete.id);
      if (success) {
        setSubscribers(prev => prev.filter(sub => sub.id !== subscriberToDelete.id));
        setIsDeleteModalOpen(false);
        setSubscriberToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting subscriber:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl mb-2 font-playfair truncate">
            Email Subscribers
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage your email subscriber list ({subscribers.length} total subscribers)
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 w-full md:w-auto" onClick={handleExport}>
          <Download className="w-4 h-4 md:mr-2 text-[var(--icon-success)]" />
          <span className="hidden md:inline">Export CSV</span>
        </Button>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <CardTitle className="text-lg md:text-xl">All Subscribers ({filteredSubscribers.length})</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--icon-info)]" />
                <Input
                  type="text"
                  placeholder="Search subscribers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <Button
                className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                onClick={() => setIsEmailModalOpen(true)}
              >
                <Mail className="w-4 h-4 sm:mr-2 text-[var(--icon-warning)]" />
                <span className="hidden sm:inline">Send Email</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading subscribers...</p>
            </div>
          ) : subscribers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No subscribers yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Subscribed Date</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscribers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        No subscribers match your search
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSubscribers.map((subscriber) => (
                      <TableRow key={subscriber.id}>
                        <TableCell className="font-medium text-xs md:text-sm truncate">{subscriber.email}</TableCell>
                        <TableCell className="text-xs md:text-sm">{subscriber.country || 'N/A'}</TableCell>
                        <TableCell className="text-xs md:text-sm whitespace-nowrap">
                          {new Date(subscriber.subscribed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              subscriber.unsubscribed_at
                                ? 'bg-red-500/10 text-red-500'
                                : 'bg-green-500/10 text-green-500'
                            }`}
                          >
                            {subscriber.unsubscribed_at ? 'Unsub' : 'Active'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(subscriber)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Email Modal */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Email to Subscribers</DialogTitle>
            <DialogDescription>
              Send an email to all {subscribers.filter((s) => !s.unsubscribed_at).length} active
              subscribers
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {sendSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/10 border border-green-500/20 rounded-lg p-3"
              >
                <p className="text-sm text-green-500">✓ Emails sent successfully!</p>
              </motion.div>
            )}

            {sendError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-destructive/10 border border-destructive/20 rounded-lg p-3"
              >
                <p className="text-sm text-destructive">{sendError}</p>
              </motion.div>
            )}

            <div>
              <label className="text-sm font-medium">Email Subject *</label>
              <Input
                placeholder="Enter email subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Email Message *</label>
              <Textarea
                placeholder="Type your email message here. This will be sent to all active subscribers."
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={6}
                className="mt-1"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEmailModalOpen(false);
                  setEmailSubject('');
                  setEmailMessage('');
                  setSendError(null);
                }}
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={handleSendEmail}
                disabled={isSending}
              >
                <Send className="w-4 h-4 mr-2 text-[var(--icon-primary)]" />
                {isSending ? 'Sending...' : 'Send Email'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subscriber</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {subscriberToDelete?.email}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSubscriberToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
