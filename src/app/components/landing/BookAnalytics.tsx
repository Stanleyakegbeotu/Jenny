import React, { useState, useEffect } from 'react';
import { Heart, Eye, Mouse, MessageCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { likeBook, isBookLikedByUser, getBookCommentsCount, getBookLikeCount, getBookReadCount, getBookClickCount } from '../../../lib/supabaseClient';

interface BookAnalyticsProps {
  bookId: string;
  totalReads?: number;
  clicks?: number;
  likes?: number;
  commentCount?: number;
  onLikeChange?: (isLiked: boolean) => void;
  onCommentsToggle?: () => void;
}

export function BookAnalytics({
  bookId,
  totalReads = 0,
  clicks = 0,
  likes = 0,
  commentCount = 0,
  onLikeChange,
  onCommentsToggle,
}: BookAnalyticsProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [realCommentCount, setRealCommentCount] = useState(commentCount);
  const [readCount, setReadCount] = useState(totalReads);
  const [clickCount, setClickCount] = useState(clicks);
  const [isLoading, setIsLoading] = useState(false);

  // Check if already liked and fetch real comment/like counts on mount
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setIsLoading(true);
        const [liked, commentCount, likeCount, readCount, clickCount] = await Promise.all([
          isBookLikedByUser(bookId),
          getBookCommentsCount(bookId),
          getBookLikeCount(bookId),
          getBookReadCount(bookId),
          getBookClickCount(bookId),
        ]);
        setIsLiked(liked);
        setRealCommentCount(commentCount);
        setLikeCount(likeCount);
        setReadCount(readCount);
        setClickCount(clickCount);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCounts();
    
    // Refresh counts every 3 seconds to catch interactions (reads, clicks) in real-time
    const interval = setInterval(() => {
      fetchCounts();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [bookId]);

  const handleLike = async () => {
    if (isLiked) {
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await likeBook(bookId);
      
      if (success) {
        // Fetch the new like count from database
        const newLikeCount = await getBookLikeCount(bookId);
        
        setIsLiked(true);
        setLikeCount(newLikeCount);
        onLikeChange?.(true);
      }
    } catch (error) {
      console.error('Error liking book:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Analytics Grid - Clickable Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Like Card - Clickable */}
        <button
          onClick={handleLike}
          disabled={isLoading || isLiked}
          className={`rounded-lg p-4 text-center border-2 transition-all transform hover:scale-105 ${
            isLiked
              ? 'bg-red-50 border-red-300 shadow-md'
              : 'bg-white border-border/30 hover:bg-red-50 hover:border-red-200 cursor-pointer'
          } ${isLoading ? 'opacity-50' : ''}`}
        >
          <Heart className={`w-6 h-6 text-red-600 mx-auto mb-2 ${
            isLiked ? 'fill-current' : ''
          }`} />
          <p className="text-2xl font-bold text-gray-900">{likeCount}</p>
          <p className="text-xs text-gray-600 font-medium">{isLiked ? 'Liked ✓' : 'Likes'}</p>
        </button>

        {/* Comments Card - Clickable */}
        <button
          onClick={onCommentsToggle}
          className="rounded-lg p-4 text-center border-2 border-border/30 bg-white hover:bg-purple-50 hover:border-purple-200 transition-all transform hover:scale-105 cursor-pointer"
        >
          <MessageCircle className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{realCommentCount}</p>
          <p className="text-xs text-gray-600 font-medium">Comments</p>
        </button>
      </div>
    </div>
  );
}
