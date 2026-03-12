import { LayoutDashboard, BookOpen, Users, BarChart3, Settings, LogOut, MessageCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { usePWAInstall } from '../../../hooks/usePWAInstall';

interface AdminSidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  collapsed: boolean;
  isMobile?: boolean;
  onRequestClose?: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'books', label: 'Books', icon: BookOpen },
  { id: 'subscribers', label: 'Subscribers', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'comments', label: 'Comments', icon: MessageCircle },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// Custom Jenny App Icon Component
function JennyAppIcon() {
  return (
    <div className="w-5 h-5 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
      <span className="text-xs font-bold text-purple-600 dark:text-purple-400">J</span>
    </div>
  );
}

export function AdminSidebar({ currentPage, onPageChange, collapsed, isMobile, onRequestClose }: AdminSidebarProps) {
  // On mobile, sidebar should be hidden when collapsed
  const shouldHide = isMobile && collapsed;
  const navigate = useNavigate();
  const { isInstallable, isInstalled, installApp } = usePWAInstall();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <>
      {/* Overlay backdrop on mobile when sidebar is open */}
      <AnimatePresence>
        {isMobile && !collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-[99] md:hidden"
            onClick={() => onRequestClose?.()} // Close sidebar when backdrop clicked
          />
        )}
      </AnimatePresence>

      <motion.div
        animate={{
          width: isMobile && collapsed ? 0 : collapsed ? 80 : 256,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`${
          isMobile ? 'fixed left-0 top-0 bottom-0 z-[100]' : 'relative'
        } h-[100svh] bg-sidebar border-r border-sidebar-border flex flex-col overflow-x-hidden ${
          isMobile && collapsed ? 'pointer-events-none' : ''
        }`}
      >
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border overflow-hidden">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h1 className="text-xl whitespace-nowrap font-playfair">
              NENSHA JENNIFER
            </h1>
            <p className="text-sm text-sidebar-foreground/60 mt-1 whitespace-nowrap">Admin Dashboard</p>
          </motion.div>
        )}
        {collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="text-xl text-center font-playfair"
          >
            NJ
          </motion.div>
        )}
      </div>

      {/* Navigation - scrollable container */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg transition-colors border border-black shadow-lg ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        {isInstallable && !isInstalled && (
          <Button 
            variant="outline"
            className={`w-full ${collapsed ? 'justify-center px-0' : 'justify-start gap-3'}`}
            onClick={installApp}
            title={collapsed ? 'Install App' : undefined}
          >
            <JennyAppIcon />
            {!collapsed && <span>Install Dashboard</span>}
          </Button>
        )}
        {isInstalled && (
          <div className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg bg-sidebar-accent/30 text-sidebar-accent-foreground`}>
            <JennyAppIcon />
            {!collapsed && <span className="text-sm">✓ Installed</span>}
          </div>
        )}
        <Button 
          variant="ghost" 
          className={`w-full ${collapsed ? 'justify-center px-0' : 'justify-start gap-3'} text-sidebar-foreground/70`}
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </motion.div>
    </>
  );
}
