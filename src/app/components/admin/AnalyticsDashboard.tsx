import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, Users, ExternalLink, Globe } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { motion } from 'motion/react';
import { fetchAnalytics, AnalyticsEvent, fetchBooks, fetchSubscribers, getBookCommentsCount, getBookCommentLikesTotal, getBookLikeCount, getBookReadCount, getBookClickCount } from '../../../lib/supabaseClient';

const ITEMS_PER_PAGE = 10;
const DAYS_PER_PAGE = 7;

const getPlatformIcon = (platform: string): string => {
  const platformLower = platform.toLowerCase();
  if (platformLower.includes('wattpad')) return '📱';
  if (platformLower.includes('inkitt')) return '📖';
  if (platformLower.includes('amazon')) return '🛍️';
  if (platformLower.includes('audible')) return '🎧';
  if (platformLower.includes('apple')) return '🍎';
  if (platformLower.includes('google')) return '🔍';
  return '🔗';
};

const PaginationControls = ({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}: {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}) => (
  <div className="flex items-center justify-center gap-2 pt-4 mt-4 border-t border-border">
    <Button
      variant="outline"
      size="sm"
      onClick={onPrevious}
      disabled={currentPage === 0}
    >
      <ChevronLeft className="w-4 h-4" />
    </Button>
    <span className="text-sm text-muted-foreground">
      Page {currentPage + 1} of {totalPages}
    </span>
    <Button
      variant="outline"
      size="sm"
      onClick={onNext}
      disabled={currentPage >= totalPages - 1}
    >
      <ChevronRight className="w-4 h-4" />
    </Button>
  </div>
);

interface DailyStats {
  date: string;
  visitors: number;
  events: AnalyticsEvent[];
}

interface PlatformRedirect {
  date: string;
  platform: string;
  count: number;
  bookId?: string;
}

interface ExternalLinkByDay {
  date: string;
  platforms: Array<{
    name: string;
    count: number;
    percentage: number;
    icon: string;
  }>;
  totalClicks: number;
}

interface BookAnalytics {
  bookId: string;
  title: string;
  views: number;
  reads: number;
  comments: number;
  likes: number;
}

export function AnalyticsDashboard() {
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [platformData, setPlatformData] = useState<PlatformRedirect[]>([]);
  const [bookAnalytics, setBookAnalytics] = useState<BookAnalytics[]>([]);
  const [countryStats, setCountryStats] = useState<{ country: string; count: number }[]>([]);
  const [externalLinksByDay, setExternalLinksByDay] = useState<ExternalLinkByDay[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [dailyPage, setDailyPage] = useState(0);
  const [platformPage, setPlatformPage] = useState(0);
  const [mostViewedPage, setMostViewedPage] = useState(0);
  const [mostReadPage, setMostReadPage] = useState(0);
  const [countryPage, setCountryPage] = useState(0);
  const [externalLinksPage, setExternalLinksPage] = useState(0);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Load analytics events, books, and subscribers
      const [events, books, subscribers] = await Promise.all([
        fetchAnalytics(),
        fetchBooks(),
        fetchSubscribers(),
      ]);

      console.log('📊 ===== ANALYTICS DASHBOARD LOAD START =====');
      console.log('Total Events:', events.length);
      
      // Log event type breakdown
      const eventTypeCounts = events.reduce((acc: any, e) => {
        acc[e.event_type] = (acc[e.event_type] || 0) + 1;
        return acc;
      }, {});
      console.log('Event Type Breakdown:', eventTypeCounts);
      console.log('Sample Events (first 5):', events.slice(0, 5));
      console.log('Total Books:', books.length);
      console.log('Total Subscribers:', subscribers.length);

      // Process daily statistics
      const dailyMap = new Map<string, AnalyticsEvent[]>();
      events.forEach((event) => {
        const date = event.timestamp.split('T')[0];
        if (!dailyMap.has(date)) {
          dailyMap.set(date, []);
        }
        dailyMap.get(date)!.push(event);
      });

      const sortedDaily = Array.from(dailyMap.entries())
        .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
        .map(([date, eventList]) => {
          const uniqueVisitors = new Set(eventList.map((e) => e.user_id || 'anonymous')).size;
          return {
            date,
            visitors: uniqueVisitors,
            events: eventList,
          };
        });

      console.log('✅ Daily Stats (first 3 days):', sortedDaily.slice(0, 3));
      setDailyStats(sortedDaily);

      // Process platform redirects (overall summary)
      const platformMap = new Map<
        string,
        { platform: string; count: number; bookId?: string }
      >();
      
      const externalLinkEvents = events.filter((e) => e.event_type === 'external_link_click');
      console.log('🔗 External Link Events Count:', externalLinkEvents.length);
      
      externalLinkEvents.forEach((event) => {
        const metadata = event.metadata as any;
        const platform = metadata?.platform || 'unknown';
        console.log(`  Platform Entry: ${platform}`, { metadata, bookId: event.book_id });
        const key = platform;
        if (!platformMap.has(key)) {
          platformMap.set(key, {
            platform,
            count: 0,
            bookId: event.book_id,
          });
        }
        platformMap.get(key)!.count++;
      });

      const sortedPlatform = Array.from(platformMap.values())
        .sort((a, b) => b.count - a.count);
      console.log('📊 Platform Redirect Summary:', sortedPlatform);
      setPlatformData(sortedPlatform);

      // Process external links by day
      const externalLinksByDateMap = new Map<string, { [platform: string]: number }>();
      externalLinkEvents.forEach((event) => {
        const date = event.timestamp.split('T')[0];
        const metadata = event.metadata as any;
        const platform = metadata?.platform || 'unknown';
        
        if (!externalLinksByDateMap.has(date)) {
          externalLinksByDateMap.set(date, {});
        }
        const dayData = externalLinksByDateMap.get(date)!;
        dayData[platform] = (dayData[platform] || 0) + 1;
      });

      const externalLinks = Array.from(externalLinksByDateMap.entries())
        .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
        .map(([date, platformData]) => {
          const totalClicks = Object.values(platformData).reduce((sum, count) => sum + (count as number), 0);
          const platformsByCount = Object.entries(platformData)
            .map(([name, count]) => ({
              name,
              count: count as number,
              percentage: totalClicks > 0 ? Math.round(((count as number) / totalClicks) * 100) : 0,
              icon: getPlatformIcon(name),
            }))
            .sort((a, b) => b.count - a.count);

          return {
            date,
            platforms: platformsByCount,
            totalClicks,
          };
        });
      console.log('📅 External Links by Day (first 3):', externalLinks.slice(0, 3));
      setExternalLinksByDay(externalLinks);

      // Process book analytics - count from analytics events plus DB counts
      console.log('📚 Processing Book Analytics...');
      const bookMap = new Map<string, BookAnalytics>();
      books.forEach((book) => {
        bookMap.set(book.id, {
          bookId: book.id,
          title: book.title,
          views: 0,
          reads: 0,
          comments: 0,
          likes: 0,
        });
      });

      // Count book_view and audio_play events from analytics
      const bookViewCount = new Map<string, number>();
      const bookAudioPlayCount = new Map<string, number>();
      
      events.forEach((event) => {
        if (event.book_id) {
          if (event.event_type === 'book_view') {
            bookViewCount.set(event.book_id, (bookViewCount.get(event.book_id) || 0) + 1);
          } else if (event.event_type === 'audio_play') {
            bookAudioPlayCount.set(event.book_id, (bookAudioPlayCount.get(event.book_id) || 0) + 1);
          }
        }
      });

      console.log('📊 Book View Events:', Array.from(bookViewCount.entries()).slice(0, 5));
      console.log('🎧 Audio Play Events:', Array.from(bookAudioPlayCount.entries()).slice(0, 5));

      // Fetch actual comment, like, read, and click counts from database for each book
      const bookAnalyticsWithCounts = await Promise.all(
        Array.from(bookMap.values()).map(async (analytics) => {
          const [commentCount, bookLikeCount, commentLikeCount, readCount, clickCount] = await Promise.all([
            getBookCommentsCount(analytics.bookId),
            getBookLikeCount(analytics.bookId),
            getBookCommentLikesTotal(analytics.bookId),
            getBookReadCount(analytics.bookId),
            getBookClickCount(analytics.bookId),
          ]);
          
          // Get counts from analytics events
          const analyticsViewCount = bookViewCount.get(analytics.bookId) || 0;
          const analyticsAudioCount = bookAudioPlayCount.get(analytics.bookId) || 0;
          
          // Total likes = book likes + comment likes
          const totalLikes = bookLikeCount + commentLikeCount;
          
          const finalAnalytics = {
            ...analytics,
            comments: commentCount,
            likes: totalLikes,
            reads: readCount,
            views: analyticsViewCount || clickCount, // prefer analytics events, fallback to DB clicks
          };
          
          console.log(`📖 Book: "${analytics.title}"`, {
            analyticsViews: analyticsViewCount,
            dbClicks: clickCount,
            finalViews: finalAnalytics.views,
            reads: readCount,
            comments: commentCount,
            likes: totalLikes,
          });
          
          return finalAnalytics;
        })
      );

      const sortedBooks = bookAnalyticsWithCounts.sort(
        (a, b) => b.views + b.reads - (a.views + a.reads)
      );
      console.log('📊 Top Books (sorted by views+reads):', sortedBooks.slice(0, 5));
      setBookAnalytics(sortedBooks);

      // Process country statistics
      const countryMap = new Map<string, number>();
      subscribers.forEach((sub) => {
        if (sub.country) {
          countryMap.set(
            sub.country,
            (countryMap.get(sub.country) || 0) + 1
          );
        }
      });

      const sortedCountries = Array.from(countryMap.entries())
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count);
      setCountryStats(sortedCountries);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl mb-2 font-playfair">Analytics</h1>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Pagination logic
  const dailyStart = dailyPage * DAYS_PER_PAGE;
  const dailyEnd = dailyStart + DAYS_PER_PAGE;
  const dailyItems = dailyStats.slice(dailyStart, dailyEnd);
  const dailyTotalPages = Math.ceil(dailyStats.length / DAYS_PER_PAGE);

  const platformStart = platformPage * ITEMS_PER_PAGE;
  const platformEnd = platformStart + ITEMS_PER_PAGE;
  const platformItems = platformData.slice(platformStart, platformEnd);
  const platformTotalPages = Math.ceil(platformData.length / ITEMS_PER_PAGE);

  const viewedStart = mostViewedPage * ITEMS_PER_PAGE;
  const viewedEnd = viewedStart + ITEMS_PER_PAGE;
  const viewedItems = bookAnalytics.slice(viewedStart, viewedEnd);
  const viewedTotalPages = Math.ceil(bookAnalytics.length / ITEMS_PER_PAGE);

  const readStart = mostReadPage * ITEMS_PER_PAGE;
  const readEnd = readStart + ITEMS_PER_PAGE;
  const readItems = bookAnalytics
    .sort((a, b) => b.reads - a.reads)
    .slice(readStart, readEnd);
  const readTotalPages = Math.ceil(bookAnalytics.length / ITEMS_PER_PAGE);

  const countryStart = countryPage * ITEMS_PER_PAGE;
  const countryEnd = countryStart + ITEMS_PER_PAGE;
  const countryItems = countryStats.slice(countryStart, countryEnd);
  const countryTotalPages = Math.ceil(countryStats.length / ITEMS_PER_PAGE);

  const externalLinksStart = externalLinksPage * DAYS_PER_PAGE;
  const externalLinksEnd = externalLinksStart + DAYS_PER_PAGE;
  const externalLinksItems = externalLinksByDay.slice(externalLinksStart, externalLinksEnd);
  const externalLinksTotalPages = Math.ceil(externalLinksByDay.length / DAYS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl mb-2 font-playfair truncate">Analytics Dashboard</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Track landing page visitors, engagement, and platform performance.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Visitors</p>
                <p className="text-2xl font-bold">
                  {dailyStats.reduce((sum, day) => sum + day.visitors, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-[var(--icon-primary)] opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Platform Clicks</p>
                <p className="text-2xl font-bold">
                  {platformData.reduce((sum, p) => sum + p.count, 0)}
                </p>
              </div>
              <ExternalLink className="w-8 h-8 text-[var(--icon-accent)] opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Book Views</p>
                <p className="text-2xl font-bold">
                  {bookAnalytics.reduce((sum, b) => sum + b.views, 0)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-[var(--icon-success)] opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Countries</p>
                <p className="text-2xl font-bold">{countryStats.length}</p>
              </div>
              <Globe className="w-8 h-8 text-[var(--icon-info)] opacity-70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Visitors */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Visitors ({dailyStats.length} days)</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No visitor data available</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Unique Visitors</TableHead>
                      <TableHead className="text-right">Total Events</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailyItems.map((day) => (
                      <TableRow key={day.date}>
                        <TableCell className="font-medium text-xs md:text-sm">
                          {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-xs md:text-sm">
                          {day.visitors}
                        </TableCell>
                        <TableCell className="text-right text-xs md:text-sm">
                          {day.events.length}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <PaginationControls
                currentPage={dailyPage}
                totalPages={dailyTotalPages}
                onPrevious={() => setDailyPage(dailyPage - 1)}
                onNext={() => setDailyPage(dailyPage + 1)}
              />
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Platform Redirects */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Redirects</CardTitle>
          </CardHeader>
          <CardContent>
            {platformItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No redirect data</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Platform</TableHead>
                        <TableHead className="text-right">Clicks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {platformItems.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium text-xs md:text-sm">{item.platform}</TableCell>
                          <TableCell className="text-right font-semibold text-xs md:text-sm">
                            {item.count}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {platformTotalPages > 1 && (
                  <PaginationControls
                    currentPage={platformPage}
                    totalPages={platformTotalPages}
                    onPrevious={() => setPlatformPage(platformPage - 1)}
                    onNext={() => setPlatformPage(platformPage + 1)}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Country Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            {countryItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No country data</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Country</TableHead>
                        <TableHead className="text-right">Subscribers</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {countryItems.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium text-xs md:text-sm">{item.country}</TableCell>
                          <TableCell className="text-right font-semibold text-xs md:text-sm">
                            {item.count}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {countryTotalPages > 1 && (
                  <PaginationControls
                    currentPage={countryPage}
                    totalPages={countryTotalPages}
                    onPrevious={() => setCountryPage(countryPage - 1)}
                    onNext={() => setCountryPage(countryPage + 1)}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Most Viewed Books */}
        <Card className="md:col-span-1 overflow-hidden">
          <CardHeader>
            <CardTitle>Most Viewed Books</CardTitle>
          </CardHeader>
          <CardContent>
            {viewedItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No view data</p>
            ) : (
              <>
                <div className="max-h-64 md:max-h-96 overflow-x-auto overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Book</TableHead>
                        <TableHead className="text-right">Views</TableHead>
                        <TableHead className="text-right">Comments</TableHead>
                        <TableHead className="text-right">Likes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewedItems.map((item) => (
                        <TableRow key={item.bookId}>
                          <TableCell className="font-medium text-xs md:text-sm truncate">{item.title}</TableCell>
                          <TableCell className="text-right font-semibold text-xs md:text-sm">
                            {item.views}
                          </TableCell>
                          <TableCell className="text-right text-xs md:text-sm">
                            {item.comments}
                          </TableCell>
                          <TableCell className="text-right text-xs md:text-sm">
                            {item.likes}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {viewedTotalPages > 1 && (
                  <PaginationControls
                    currentPage={mostViewedPage}
                    totalPages={viewedTotalPages}
                    onPrevious={() => setMostViewedPage(mostViewedPage - 1)}
                    onNext={() => setMostViewedPage(mostViewedPage + 1)}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Most Read Books */}
        <Card className="md:col-span-1 overflow-hidden">
          <CardHeader>
            <CardTitle>Most Read Books</CardTitle>
          </CardHeader>
          <CardContent>
            {readItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No read data</p>
            ) : (
              <>
                <div className="max-h-64 md:max-h-96 overflow-x-auto overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Book</TableHead>
                        <TableHead className="text-right">Reads</TableHead>
                        <TableHead className="text-right">Comments</TableHead>
                        <TableHead className="text-right">Likes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {readItems.map((item) => (
                        <TableRow key={item.bookId}>
                          <TableCell className="font-medium text-xs md:text-sm truncate">{item.title}</TableCell>
                          <TableCell className="text-right font-semibold text-xs md:text-sm">
                            {item.reads}
                          </TableCell>
                          <TableCell className="text-right text-xs md:text-sm">
                            {item.comments}
                          </TableCell>
                          <TableCell className="text-right text-xs md:text-sm">
                            {item.likes}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {readTotalPages > 1 && (
                  <PaginationControls
                    currentPage={mostReadPage}
                    totalPages={readTotalPages}
                    onPrevious={() => setMostReadPage(mostReadPage - 1)}
                    onNext={() => setMostReadPage(mostReadPage + 1)}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* External Links Tracking by Date */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            External Links Tracking (Daily)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {externalLinksItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No external link data available</p>
          ) : (
            <>
              <div className="space-y-6">
                {externalLinksItems.map((dayData) => (
                  <motion.div
                    key={dayData.date}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">
                        {new Date(dayData.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </h3>
                      <div className="bg-primary/10 px-3 py-1 rounded-full">
                        <span className="text-sm font-semibold text-primary">
                          {dayData.totalClicks} clicks
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {dayData.platforms.map((platform) => (
                        <div
                          key={platform.name}
                          className="flex items-center justify-between p-3 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{platform.icon}</span>
                            <div>
                              <p className="font-medium text-sm capitalize">{platform.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {platform.count} {platform.count === 1 ? 'click' : 'clicks'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm">{platform.percentage}%</p>
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${platform.percentage * 0.64}px` }}
                              transition={{ duration: 0.5, ease: 'easeOut' }}
                              className="h-2 bg-primary rounded-full mt-1"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
              {externalLinksTotalPages > 1 && (
                <PaginationControls
                  currentPage={externalLinksPage}
                  totalPages={externalLinksTotalPages}
                  onPrevious={() => setExternalLinksPage(externalLinksPage - 1)}
                  onNext={() => setExternalLinksPage(externalLinksPage + 1)}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
