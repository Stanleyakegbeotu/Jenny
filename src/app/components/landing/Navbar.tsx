import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, ChevronDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useI18n, Language } from '../../../hooks/useI18n';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const { theme, toggleTheme } = useTheme();
  const { t, currentLanguage, changeLanguage, languages } = useI18n();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeout) clearTimeout(clickTimeout);
    };
  }, [clickTimeout]);

  const handleLogoClick = () => {
    // Clear existing timeout
    if (clickTimeout) clearTimeout(clickTimeout);

    const newClickCount = logoClicks + 1;
    setLogoClicks(newClickCount);

    // Check if 5 clicks reached
    if (newClickCount === 5) {
      navigate('/admin');
      setLogoClicks(0);
      return;
    }

    // Reset counter after 3 seconds of no clicks
    const timeout = setTimeout(() => {
      setLogoClicks(0);
    }, 3000);

    setClickTimeout(timeout);

    // Home navigation for single click or less than 5
    if (newClickCount === 1) {
      navigate('/');
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/95 backdrop-blur-lg border-b border-border shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleLogoClick}
            title={logoClicks > 0 && logoClicks < 5 ? `Admin access: ${logoClicks}/5` : ''}
          >
            <h1 className="text-2xl tracking-wide font-playfair">
              {t('nav.logo')}
            </h1>
          </div>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-foreground hover:text-primary transition-colors">
              {t('nav.home')}
            </a>
            <a href="#books" className="text-foreground hover:text-primary transition-colors">
              {t('nav.books')}
            </a>
            <a href="#about" className="text-foreground hover:text-primary transition-colors">
              {t('nav.about')}
            </a>
            <a href="#contact" className="text-foreground hover:text-primary transition-colors">
              {t('nav.contact')}
            </a>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <span>{languages[currentLanguage]?.flag || '🇬🇧'}</span>
                  <span className="hidden sm:inline">{languages[currentLanguage]?.name || 'Language'}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  {t('nav.language', 'Language')}
                </div>
                {(Object.keys(languages) as Language[]).map((lang) => (
                  <DropdownMenuItem
                    key={lang}
                    onClick={() => changeLanguage(lang)}
                    className="gap-2"
                  >
                    <span>{languages[lang].flag}</span>
                    <span>{languages[lang].name}</span>
                    {currentLanguage === lang && <span className="ml-auto">✓</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {/* CTA Button */}
            <Button
              className="hidden lg:flex bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => {
                document.getElementById('featured-book')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {t('nav.readLatest')}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}