import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  getBookComments,
  addBookComment,
  BookComment,
} from '../../../lib/supabaseClient';
import { trackCommentSubmitted } from '../../../lib/analytics';

interface BookCommentsProps {
  bookId: string;
}

export function BookComments({ bookId }: BookCommentsProps) {
  const [comments, setComments] = useState<BookComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load comments
  const loadComments = async () => {
    try {
      const loadedComments = await getBookComments(bookId);
      setComments(loadedComments);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  useEffect(() => {
    loadComments();
  }, [bookId]);

  // Submit new comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError(null);
    const addedComment = await addBookComment(
      bookId,
      authorName,
      newComment
    );
    
    if (addedComment) {
      setNewComment('');
      setAuthorName('');
      await loadComments();
      trackCommentSubmitted(bookId, authorName);
    } else {
      setError('Failed to add comment. This feature may need to be enabled in settings.');
    }
    setIsLoading(false);
  };



  // Render comment
  const renderComment = (comment: BookComment) => {
    return (
      <div key={comment.id} className="mb-4">
        <div className="bg-muted/50 rounded-lg p-4">
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
          <p className="text-sm mb-3 break-words whitespace-pre-wrap">{comment.content}</p>
          {comment.likes > 0 && (
            <div className="text-xs text-muted-foreground">
              👍 {comment.likes} {comment.likes === 1 ? 'like' : 'likes'}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full border border-border/50 rounded-lg p-6 bg-card shadow-md">
      {/* New comment form */}
      <div className="mb-6 pb-6 border-b border-border/30">
        <h3 className="text-lg font-semibold mb-4">Comments ({comments.length})</h3>
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start justify-between">
            <p className="text-sm text-destructive">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-destructive/50 hover:text-destructive ml-2"
            >
              ✕
            </button>
          </div>
        )}
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
      <div className="max-h-96 overflow-y-auto pr-2">
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
