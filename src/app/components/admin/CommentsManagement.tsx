import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import {
  fetchAllComments,
  replyToComment,
  getCommentReactionsSummary,
  getUserCommentReaction,
  addCommentReaction,
  AdminBookComment,
  ReactionType,
} from '../../../lib/supabaseClient';
import { getVisitorId } from '../../../lib/visitorId';

export function CommentsManagement() {
  const [comments, setComments] = useState<AdminBookComment[]>([]);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [reactionsSummary, setReactionsSummary] = useState<Record<string, Record<string, number>>>({});
  const [userReactions, setUserReactions] = useState<Record<string, ReactionType | null>>({});

  const REACTIONS: { type: ReactionType; label: string }[] = [
    { type: 'like', label: 'Like' },
    { type: 'love', label: 'Love' },
    { type: 'wow', label: 'Wow' },
    { type: 'sad', label: 'Sad' },
    { type: 'angry', label: 'Angry' },
  ];

  const load = async () => {
    setLoading(true);
    const data = await fetchAllComments();
    setComments(data);

    const visitorId = getVisitorId();
    const summaries = await Promise.all(
      data.map(async (c) => ({
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
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleReply = async (commentId: string) => {
    const text = replyText[commentId] || '';
    if (!text.trim()) return;
    await replyToComment(commentId, 'Admin', text.trim(), true);
    setReplyText((prev) => ({ ...prev, [commentId]: '' }));
    await load();
  };

  const handleReact = async (commentId: string, reaction: ReactionType) => {
    const visitorId = getVisitorId();
    const result = await addCommentReaction(commentId, visitorId, reaction);
    if (result.success) {
      const summary = await getCommentReactionsSummary(commentId);
      setReactionsSummary((prev) => ({ ...prev, [commentId]: summary }));
      setUserReactions((prev) => ({ ...prev, [commentId]: reaction }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl mb-2 font-playfair truncate">Comments</h1>
        <p className="text-muted-foreground text-sm md:text-base">Review and reply to visitor comments.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Comments</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[70vh] overflow-y-auto pr-2">
          {loading ? (
            <p className="text-muted-foreground">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-muted-foreground">No comments yet.</p>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="border border-border/50 rounded-lg p-4">
                  <div className="text-xs text-muted-foreground mb-2">
                    Book: {c.bookTitle || 'Unknown'}
                  </div>
                  <div className="text-sm font-semibold">{c.author}</div>
                  <div className="text-sm text-muted-foreground mb-3">{c.content}</div>

                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-2">
                    {REACTIONS.map((r) => (
                      <span key={r.type}>
                        {r.label}: {reactionsSummary[c.id]?.[r.type] || 0}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {REACTIONS.map((r) => (
                      <Button
                        key={r.type}
                        size="sm"
                        variant="outline"
                        disabled={!!userReactions[c.id]}
                        onClick={() => handleReact(c.id, r.type)}
                      >
                        {r.label}
                      </Button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Textarea
                      placeholder="Write a reply..."
                      value={replyText[c.id] || ''}
                      onChange={(e) => setReplyText((prev) => ({ ...prev, [c.id]: e.target.value }))}
                      className="border border-border/50 rounded-lg resize-none h-24"
                    />
                    <Button size="sm" onClick={() => handleReply(c.id)}>
                      Reply as Admin
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
