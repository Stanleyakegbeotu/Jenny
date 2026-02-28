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
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [dailyPage, setDailyPage] = useState(0);
  const [platformPage, setPlatformPage] = useState(0);
  const [mostViewedPage, setMostViewedPage] = useState(0);
  const [mostReadPage, setMostReadPage] = useState(0);
  const [countryPage, setCountryPage] = useState(0);

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
        .map(([date, eventList]) => ({
          date,
          visitors: new Set(eventList.map((e) => e.user_id || 'anonymous')).size,
          events: eventList,
        }));

      setDailyStats(sortedDaily);

      // Process platform redirects
      const platformMap = new Map<
        string,
        { platform: string; count: number; bookId?: string }
      >();
      events
        .filter((e) => e.event_type === 'external_link')
        .forEach((event) => {
          const metadata = event.metadata as any;
          const platform = metadata?.platform || 'unknown';
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
      setPlatformData(sortedPlatform);

      // Process book analytics
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

      events.forEach((event) => {
        if (event.book_id && bookMap.has(event.book_id)) {
          const analytics = bookMap.get(event.book_id)!;
          if (event.event_type === 'book_view') {
            analytics.views++;
          } else if (event.event_type === 'audio_play') {
            analytics.reads++;
          }
        }
      });

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
          // Total likes = book likes + comment likes
          const totalLikes = bookLikeCount + commentLikeCount;
          return {
            ...analytics,
            comments: commentCount,
            likes: totalLikes,
            reads: readCount,
            views: clickCount, // views = clicks on the book
          };
        })
      );

      const sortedBooks = bookAnalyticsWithCounts.sort(
        (a, b) => b.views + b.reads - (a.views + a.reads)
      );
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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-4 border-t border-border">
      <span className="text-xs sm:text-sm text-muted-foreground">
        Page {currentPage + 1} of {totalPages || 1}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={currentPage === 0}
          className="flex-1 sm:flex-none"
        >
          <ChevronLeft className="w-4 h-4 text-[var(--icon-accent)]" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={currentPage >= totalPages - 1}
          className="flex-1 sm:flex-none"
        >
          <ChevronRight className="w-4 h-4 text-[var(--icon-accent)]" />
        </Button>
      </div>
    </div>
  );

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
    </div>
  );
}
