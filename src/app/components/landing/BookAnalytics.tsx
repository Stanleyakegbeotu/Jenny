import React, { useState } from 'react';
import { Heart, Eye, Mouse, MessageCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { likeBook, isBookLikedByUser } from '../../../lib/supabaseClient';

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
  const [isLoading, setIsLoading] = useState(false);

  // Check if already liked on mount
  React.useEffect(() => {
    const checkLike = async () => {
      const liked = await isBookLikedByUser(bookId);
      setIsLiked(liked);
    };
    checkLike();
  }, [bookId]);

  const handleLike = async () => {
    setIsLoading(true);
    const success = await likeBook(bookId);
    
    if (success) {
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setLikeCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));
      onLikeChange?.(newIsLiked);
    }
    setIsLoading(false);
  };

  const stats = [
    {
      icon: Eye,
      label: 'Reads',
      value: totalReads,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Mouse,
      label: 'Clicks',
      value: clicks,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
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
      value: commentCount,
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
        disabled={isLoading}
        variant={isLiked ? 'default' : 'outline'}
        className={`w-full gap-2 py-2 ${
          isLiked
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'border border-border/50 hover:bg-red-50'
        }`}
      >
        <Heart
          className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`}
        />
        {isLiked ? 'Liked' : 'Like this book'}
      </Button>
    </div>
  );
}
