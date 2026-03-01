import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, BookOpen, Eye, Mail, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { fetchBooks, fetchSubscribers } from '../../../lib/supabaseClient';

interface StatItem {
  title: string;
  value: string;
  change?: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

interface ActivityItem {
  action: string;
  detail: string;
  time: string;
  type: 'book_read' | 'subscriber' | 'like' | 'click';
  page: 'analytics' | 'subscribers' | 'books';
}

interface DashboardOverviewProps {
  onNavigateTo?: (page: string) => void;
}

export function DashboardOverview({ onNavigateTo }: DashboardOverviewProps) {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Fetch books data
        const books = await fetchBooks();
        
        // Fetch subscribers
        const subscribers = await fetchSubscribers();

        // Calculate real statistics
        const totalReads = books.reduce((sum, book) => sum + (book.totalReads || 0), 0);
        const totalClicks = books.reduce((sum, book) => sum + (book.clicks || 0), 0);
        const totalLikes = books.reduce((sum, book) => sum + (book.likes || 0), 0);
        const subscriberCount = subscribers.length;

        // Build stats array with real data
        const calculatedStats: StatItem[] = [
          {
            title: 'Total Reads',
            value: totalReads.toLocaleString(),
            icon: Eye,
            color: 'text-[var(--icon-info)]',
            bgColor: 'bg-[var(--icon-info)]/10',
          },
          {
            title: 'Books Published',
            value: books.length.toString(),
            icon: BookOpen,
            color: 'text-[var(--icon-primary)]',
            bgColor: 'bg-[var(--icon-primary)]/10',
          },
          {
            title: 'Email Subscribers',
            value: subscriberCount.toLocaleString(),
            icon: Mail,
            color: 'text-[var(--icon-success)]',
            bgColor: 'bg-[var(--icon-success)]/10',
          },
          {
            title: 'Book Interactions',
            value: (totalClicks + totalLikes).toLocaleString(),
            icon: Users,
            color: 'text-[var(--icon-purple)]',
            bgColor: 'bg-[var(--icon-purple)]/10',
          },
        ];

        setStats(calculatedStats);

        // Build recent activity from real data
        const activities: ActivityItem[] = [];

        // Add recent book reads
        books
          .filter(book => book.totalReads && book.totalReads > 0)
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 3)
          .forEach(book => {
            activities.push({
              action: 'Book read',
              detail: `${book.title} - ${book.totalReads} total reads`,
              time: 'Recently',
              type: 'book_read',
              page: 'analytics',
            });
          });

        // Add recent subscribers
        subscribers
          .sort((a, b) => new Date(b.subscribed_at).getTime() - new Date(a.subscribed_at).getTime())
          .slice(0, 2)
          .forEach(subscriber => {
            const daysAgo = Math.floor(
              (Date.now() - new Date(subscriber.subscribed_at).getTime()) / (1000 * 60 * 60 * 24)
            );
            const timeAgo = daysAgo === 0 ? 'Today' : `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
            activities.push({
              action: 'New subscriber',
              detail: subscriber.email,
              time: timeAgo,
              type: 'subscriber',
              page: 'subscribers',
            });
          });

        // Sort activities by relevance
        activities.sort((a, b) => {
          const timeMap: { [key: string]: number } = {
            'Today': 0,
            'Recently': 1,
          };
          const aTime = timeMap[a.time] ?? 999;
          const bTime = timeMap[b.time] ?? 999;
          return aTime - bTime;
        });

        setRecentActivity(activities.slice(0, 5));
        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl mb-2 font-playfair">Dashboard Overview</h1>
          <p className="text-muted-foreground">Loading your dashboard data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded mb-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl mb-2 font-playfair truncate">Dashboard Overview</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Welcome back! Here's what's happening with your author platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  {stat.change && (
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="w-4 h-4 text-[var(--icon-success)]" />
                      <span className="text-[var(--icon-success)]">{stat.change}</span>
                      <span className="text-muted-foreground">from last month</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-80 overflow-y-auto pr-2 space-y-0">
            {recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No recent activity</p>
            ) : (
              recentActivity.map((activity, index) => (
                <button
                  key={index}
                  onClick={() => onNavigateTo?.(activity.page)}
                  className="w-full flex flex-col md:flex-row md:items-start md:justify-between py-3 px-3 md:px-2 border-b border-border last:border-0 gap-2 rounded-lg hover:bg-accent/50 transition-all duration-200 cursor-pointer text-left group"
                  title={`Go to ${activity.page} page`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground text-sm md:text-base group-hover:text-primary transition-colors">
                      {activity.action}
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground break-words line-clamp-2">
                      {activity.detail}
                    </div>
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground flex-shrink-0 md:whitespace-nowrap">
                    {activity.time}
                  </div>
                </button>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
