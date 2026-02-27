import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  getBookComments,
  addBookComment,
  replyToComment,
  likeBook,
  isBookLikedByUser,
  BookComment,
} from '../../../lib/supabaseClient';

interface BookCommentsProps {
  bookId: string;
}

export function BookComments({ bookId }: BookCommentsProps) {
  const [comments, setComments] = useState<BookComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set());

  // Load comments
  const loadComments = async () => {
    const loadedComments = await getBookComments(bookId);
    setComments(loadedComments);
  };

  useEffect(() => {
    loadComments();
  }, [bookId]);

  // Submit new comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim()) return;

    setIsLoading(true);
    const addedComment = await addBookComment(
      bookId,
      authorName,
      newComment
    );
    
    if (addedComment) {
      setNewComment('');
      setAuthorName('');
      await loadComments();
    }
    setIsLoading(false);
  };

  // Submit reply
  const handleSubmitReply = async (parentCommentId: string) => {
    if (!replyText.trim() || !authorName.trim()) return;

    setIsLoading(true);
    const addedReply = await replyToComment(
      parentCommentId,
      authorName,
      replyText
    );

    if (addedReply) {
      setReplyText('');
      setReplyingTo(null);
      await loadComments();
    }
    setIsLoading(false);
  };

  // Toggle like on comment
  const handleLikeComment = (commentId: string) => {
    setLikedCommentIds(prev => {
      const updated = new Set(prev);
      if (updated.has(commentId)) {
        updated.delete(commentId);
      } else {
        updated.add(commentId);
      }
      return updated;
    });
  };

  // Recursive comment renderer
  const renderComment = (comment: BookComment, depth = 0) => {
    const isLiked = likedCommentIds.has(comment.id);
    const indentClass = depth > 0 ? 'ml-6 border-l-2 border-border pl-4' : '';

    return (
      <div key={comment.id} className={`mb-4 ${indentClass}`}>
        <div className="bg-muted/50 rounded-lg p-4 mb-3">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-semibold text-sm">
                {comment.author}
                {comment.isAdmin && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    Author
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(comment.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <p className="text-sm mb-3">{comment.content}</p>
          <div className="flex gap-3">
            <Button
              variant={isLiked ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleLikeComment(comment.id)}
              className="text-xs gap-1 h-8"
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{comment.likes + (isLiked ? 1 : 0)}</span>
            </Button>
            {depth < 2 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-xs gap-1 h-8"
              >
                <MessageCircle className="w-4 h-4" />
                Reply
              </Button>
            )}
          </div>
        </div>

        {/* Reply form */}
        {replyingTo === comment.id && (
          <div className="bg-muted/30 rounded-lg p-3 mb-4">
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Your name"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="text-sm"
              />
            </div>
            <Textarea
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="text-sm mb-2 resize-none h-20"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleSubmitReply(comment.id)}
                disabled={isLoading || !replyText.trim() || !authorName.trim()}
              >
                Post Reply
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setReplyingTo(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Render replies */}
        {comment.replies.length > 0 && (
          <div className="mt-4">
            {comment.replies.map((reply: BookComment) => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full border border-border/50 rounded-lg p-6 bg-card shadow-md">
      {/* New comment form */}
      <div className="mb-6 pb-6 border-b border-border/30">
        <h3 className="text-lg font-semibold mb-4">Comments ({comments.length})</h3>
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <Input
            placeholder="Your name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="border border-border/50 rounded-lg"
          />
          <Textarea
            placeholder="Share your thoughts about this book..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="border border-border/50 rounded-lg resize-none h-24"
          />
          <Button
            type="submit"
            disabled={isLoading || !newComment.trim() || !authorName.trim()}
            className="w-full"
          >
            {isLoading ? 'Posting...' : 'Post Comment'}
          </Button>
        </form>
      </div>

      {/* Comments list */}
      <div>
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
}
