import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  getBookComments,
  addBookComment,
  replyToComment,
  getCommentReactionsSummary,
  getUserCommentReaction,
  addCommentReaction,
  BookComment,
  ReactionType,
} from '../../../lib/supabaseClient';
import { trackCommentSubmitted } from '../../../lib/analytics';
import { getVisitorId } from '../../../lib/visitorId';
import { useI18n } from '../../../hooks/useI18n';

interface BookCommentsProps {
  bookId: string;
  onCountChange?: (count: number) => void;
}

export function BookComments({ bookId, onCountChange }: BookCommentsProps) {
  const { t } = useI18n();
  const [comments, setComments] = useState<BookComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [reactionsSummary, setReactionsSummary] = useState<Record<string, Record<string, number>>>({});
  const [userReactions, setUserReactions] = useState<Record<string, ReactionType | null>>({});

  const REACTIONS: { type: ReactionType; label: string }[] = [
    { type: 'like', label: t('reactions.like', 'Like') },
    { type: 'love', label: t('reactions.love', 'Love') },
    { type: 'wow', label: t('reactions.wow', 'Wow') },
    { type: 'sad', label: t('reactions.sad', 'Sad') },
    { type: 'angry', label: t('reactions.angry', 'Angry') },
  ];

  const loadComments = async () => {
    try {
      const loadedComments = await getBookComments(bookId);
      setComments(loadedComments);
      const countAll = (list: BookComment[]): number =>
        list.reduce((acc, c) => acc + 1 + (c.replies ? countAll(c.replies) : 0), 0);
      onCountChange?.(countAll(loadedComments));

      const visitorId = getVisitorId();
      const allComments: BookComment[] = [];
      const collect = (list: BookComment[]) => {
        list.forEach((c) => {
          allComments.push(c);
          if (c.replies?.length) collect(c.replies);
        });
      };
      collect(loadedComments);

      const summaries = await Promise.all(
        allComments.map(async (c) => ({
          id: c.id,
          summary: await getCommentReactionsSummary(c.id),
          user: await getUserCommentReaction(c.id, visitorId),
        }))
      );
      const nextSummary: Record<string, Record<string, number>> = {};
      const nextUser: Record<string, ReactionType | null> = {};
      summaries.forEach((s) => {
        nextSummary[s.id] = s.summary;
        nextUser[s.id] = s.user;
      });
      setReactionsSummary(nextSummary);
      setUserReactions(nextUser);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  useEffect(() => {
    loadComments();
  }, [bookId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim()) {
      setError(t('comments.validationError', 'Please fill in all fields'));
      return;
    }

    setIsLoading(true);
    setError(null);
    const addedComment = await addBookComment(bookId, authorName, newComment);

    if (addedComment) {
      setNewComment('');
      setAuthorName('');
      await loadComments();
      trackCommentSubmitted(bookId, authorName);
    } else {
      setError(t('comments.error', 'Failed to add comment. This feature may need to be enabled in settings.'));
    }
    setIsLoading(false);
  };

  const handleReply = async (parentId: string) => {
    if (!replyText.trim() || !authorName.trim()) {
      setError(t('comments.replyValidation', 'Please enter your name and a reply'));
      return;
    }
    setIsLoading(true);
    setError(null);
    const reply = await replyToComment(parentId, authorName, replyText, false);
    if (reply) {
      setReplyText('');
      setReplyingTo(null);
      await loadComments();
      trackCommentSubmitted(bookId, authorName);
    } else {
      setError(t('comments.replyError', 'Failed to add reply. Please try again.'));
    }
    setIsLoading(false);
  };

  const handleReactToComment = async (commentId: string, reaction: ReactionType) => {
    const visitorId = getVisitorId();
    const result = await addCommentReaction(commentId, visitorId, reaction);
    if (result.success) {
      const summary = await getCommentReactionsSummary(commentId);
      setReactionsSummary((prev) => ({ ...prev, [commentId]: summary }));
      setUserReactions((prev) => ({ ...prev, [commentId]: reaction }));
    }
  };

  const renderComment = (comment: BookComment, depth: number = 0) => {
    const summary = reactionsSummary[comment.id] || {};
    const userReaction = userReactions[comment.id];

    return (
      <div key={comment.id} className="mb-4">
        <div className={`bg-muted/50 rounded-lg p-4 ${depth > 0 ? 'ml-4 border-l-2 border-border/50' : ''}`}>
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-semibold text-sm">
                {comment.author}
                {comment.isAdmin && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {t('comments.authorBadge', 'Author')}
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(comment.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <p className="text-sm mb-3 break-words whitespace-pre-wrap">{comment.content}</p>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-2">
            {REACTIONS.map((r) => (
              <span key={r.type}>
                {r.label}: {summary[r.type] || 0}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {REACTIONS.map((r) => (
              <button
                key={r.type}
                onClick={() => handleReactToComment(comment.id, r.type)}
                disabled={!!userReaction}
                className={`px-2 py-1 rounded-full text-xs border ${
                  userReaction
                    ? 'bg-muted text-muted-foreground border-border/40'
                    : 'bg-secondary hover:bg-secondary/70 border-border/50'
                }`}
              >
                {r.label}
              </button>
            ))}
            <button
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="px-2 py-1 rounded-full text-xs border bg-secondary hover:bg-secondary/70 border-border/50"
            >
              {t('comments.reply', 'Reply')}
            </button>
          </div>

          {replyingTo === comment.id && (
            <div className="mt-3 space-y-2">
              <Textarea
                placeholder={t('comments.replyPlaceholder', 'Write your reply...')}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="border border-border/50 rounded-lg resize-none h-20"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleReply(comment.id)}
                  disabled={isLoading || !replyText.trim() || !authorName.trim()}
                >
                  {isLoading ? t('comments.posting', 'Posting...') : t('comments.postReply', 'Post Reply')}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setReplyingTo(null)}>
                  {t('common.cancel', 'Cancel')}
                </Button>
              </div>
            </div>
          )}
        </div>

        {comment.replies?.length > 0 && (
          <div className="mt-3">
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full border border-border/50 rounded-lg p-6 bg-card shadow-md">
      <div className="mb-6 pb-6 border-b border-border/30">
        <h3 className="text-lg font-semibold mb-4">
          {t('comments.title', 'Comments')} ({comments.length})
        </h3>
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start justify-between">
            <p className="text-sm text-destructive">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-destructive/50 hover:text-destructive ml-2"
            >
              x
            </button>
          </div>
        )}
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <Input
            placeholder={t('comments.name', 'Your name')}
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="border border-border/50 rounded-lg"
          />
          <Textarea
            placeholder={t('comments.placeholder', 'Share your thoughts about this book...')}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="border border-border/50 rounded-lg resize-none h-24"
          />
          <Button
            type="submit"
            disabled={isLoading || !newComment.trim() || !authorName.trim()}
            className="w-full"
          >
            {isLoading ? t('comments.posting', 'Posting...') : t('comments.post', 'Post Comment')}
          </Button>
        </form>
      </div>

      <div className="max-h-96 overflow-y-auto pr-2">
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">
            {t('comments.empty', 'No comments yet. Be the first to comment!')}
          </p>
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
      </div>
    </div>
  );
}
