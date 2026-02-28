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
}

export function BookAnalytics({
  bookId,
  totalReads = 0,
  clicks = 0,
  likes = 0,
  commentCount = 0,
  onLikeChange,
}: BookAnalyticsProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [realCommentCount, setRealCommentCount] = useState(commentCount);
  const [readCount, setReadCount] = useState(totalReads);
  const [clickCount, setClickCount] = useState(clicks);
  const [isLoading, setIsLoading] = useState(false);

  // Check if already liked and fetch real comment/like counts on mount
  useEffect(() => {
    console.log('📚 BookAnalytics mounted for book:', bookId);
    
    const fetchCounts = async () => {
      try {
        setIsLoading(true);
        console.log('🔍 Fetching all analytics...');
        const [liked, commentCount, likeCount, readCount, clickCount] = await Promise.all([
          isBookLikedByUser(bookId),
          getBookCommentsCount(bookId),
          getBookLikeCount(bookId),
          getBookReadCount(bookId),
          getBookClickCount(bookId),
        ]);
        console.log('✅ Fetch complete - liked:', liked, 'comments:', commentCount, 'likes:', likeCount, 'reads:', readCount, 'clicks:', clickCount);
        setIsLiked(liked);
        setRealCommentCount(commentCount);
        setLikeCount(likeCount);
        setReadCount(readCount);
        setClickCount(clickCount);
      } catch (error) {
        console.error('❌ Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCounts();
    
    // Refresh counts every 3 seconds to catch interactions (reads, clicks) in real-time
    const interval = setInterval(() => {
      console.log('🔄 Refreshing analytics...');
      fetchCounts();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [bookId]);

  const handleLike = async () => {
    console.log('🔍 Like button clicked for book:', bookId);
    console.log('📊 Current state - isLiked:', isLiked, 'isLoading:', isLoading);
    
    if (isLiked) {
      console.log('⚠️ Already liked, preventing duplicate');
      return;
    }
    
    setIsLoading(true);
    console.log('⏳ Attempting to like book...');
    try {
      const success = await likeBook(bookId);
      console.log('📝 Like result:', success);
      
      if (success) {
        console.log('✅ Like successful, fetching updated count...');
        // Fetch the new like count from database
        const newLikeCount = await getBookLikeCount(bookId);
        console.log('📊 Updated like count:', newLikeCount);
        
        setIsLiked(true);
        setLikeCount(newLikeCount);
        onLikeChange?.(true);
      } else {
        console.warn('⚠️ Like failed - check console for error details');
      }
    } catch (error) {
      console.error('🔴 Exception during like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      icon: Heart,
      label: 'Likes',
      value: likeCount,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      icon: MessageCircle,
      label: 'Comments',
      value: realCommentCount,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Analytics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`${stat.bgColor} rounded-lg p-3 text-center border border-border/30`}
            >
              <Icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Like Button */}
      <Button
        onClick={handleLike}
        disabled={isLoading || isLiked}
        className={`w-full gap-2 py-2 transition-colors ${
          isLiked
            ? 'bg-red-600 text-white border border-red-600 hover:bg-red-700'
            : 'bg-white border border-border/50 text-gray-900 hover:bg-red-50 hover:border-red-200'
        }`}
      >
        <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
        {isLiked ? 'Liked ✓' : 'Like this book'}
      </Button>
    </div>
  );
}
