import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { DashboardOverview } from '../components/admin/DashboardOverview';
import { BooksManagement } from '../components/admin/BooksManagement';
import { AnalyticsDashboard } from '../components/admin/AnalyticsDashboard';
import { SubscribersManagement } from '../components/admin/SubscribersManagement';
import { SettingsPage } from '../components/admin/SettingsPage';
import { Moon, Sun, Menu, Download, Bell, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useTheme } from '../contexts/ThemeContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useAppBadge } from '../../hooks/useAppBadge';
import { fetchBooks, fetchSubscribers } from '../../lib/supabaseClient';

export function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);
  const { theme, toggleTheme } = useTheme();
  const { isInstallable, isInstalled, installApp } = usePWAInstall();
  const { badgeCount, incrementBadge, clearBadge } = useAppBadge();

  // Handle mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Always collapse on mobile, always expanded on desktop on first load
      setSidebarCollapsed(mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Track engagement and update badge
  useEffect(() => {
    const trackEngagement = async () => {
      try {
        const books = await fetchBooks();
        const subscribers = await fetchSubscribers();

        // Calculate current engagement metrics
        const totalReads = books.reduce((sum, book) => sum + (book.totalReads || 0), 0);
        const totalClicks = books.reduce((sum, book) => sum + (book.clicks || 0), 0);
        const totalLikes = books.reduce((sum, book) => sum + (book.likes || 0), 0);
        const totalEngagement = totalReads + totalClicks + totalLikes + subscribers.length;

        // Get last tracked engagement count
        const lastTrackedEngagement = parseInt(localStorage.getItem('lastTrackedEngagement') || '0', 10);
        
        // If new engagement detected, increment badge
        if (totalEngagement > lastTrackedEngagement) {
          const newEngagements = totalEngagement - lastTrackedEngagement;
          incrementBadge(newEngagements);
          localStorage.setItem('lastTrackedEngagement', String(totalEngagement));
        }

        localStorage.setItem('lastTrackedEngagement', String(totalEngagement));
      } catch (error) {
        console.error('Error tracking engagement:', error);
      }
    };

    // Track engagement on mount and every 2 minutes (120000ms)
    trackEngagement();
    const interval = setInterval(trackEngagement, 120000);

    return () => clearInterval(interval);
  }, [incrementBadge]);

  // Extract current page from URL path
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path.includes('/admin/books')) return 'books';
    if (path.includes('/admin/analytics')) return 'analytics';
    if (path.includes('/admin/subscribers')) return 'subscribers';
    if (path.includes('/admin/settings')) return 'settings';
    return 'dashboard';
  };

  const currentPage = getCurrentPage();

  const handlePageChange = (page: string) => {
    if (page === 'dashboard') {
      navigate('/admin');
    } else {
      navigate(`/admin/${page}`);
    }
    // Close sidebar on mobile after navigation
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'books':
        return <BooksManagement />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'subscribers':
        return <SubscribersManagement />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-background relative">
      {/* Mobile overlay backdrop */}
      {isMobile && !sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      <AdminSidebar
        currentPage={currentPage}
        onPageChange={handlePageChange}
        collapsed={sidebarCollapsed}
        isMobile={isMobile}
      />
      
      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/')}
                title="Exit Admin Dashboard"
              >
                <X className="w-5 h-5" />
              </Button>
              {badgeCount > 0 && (
                <div className="relative">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={clearBadge}
                    className="gap-2"
                  >
                    <Bell className="w-4 h-4" />
                    <span className="text-xs font-semibold">{badgeCount}</span>
                  </Button>
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </div>
                </div>
              )}
              {isInstallable && !isInstalled && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={installApp}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Install App
                </Button>
              )}
              {isInstalled && (
                <span className="text-xs text-muted-foreground px-2 py-1 bg-secondary rounded">
                  ✓ App Installed
                </span>
              )}
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">{renderPage()}</div>
      </div>
    </div>
  );
}