import { Heart, Instagram, Twitter, Facebook, Mail } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui/button';
import { Moon, Sun } from 'lucide-react';
import { useI18n } from '../../../hooks/useI18n';

export function Footer() {
  const { theme, toggleTheme } = useTheme();
  const { t, currentLanguage, changeLanguage, languages } = useI18n();

  return (
    <footer className="bg-secondary/50 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-2xl mb-4 font-playfair">
              {t('nav.logo')}
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              {t('footer.description', 'International romance author crafting stories that capture hearts and souls worldwide.')}
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Mail className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.quickLinks', 'Quick Links')}</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#home" className="hover:text-primary transition-colors">
                  {t('nav.home')}
                </a>
              </li>
              <li>
                <a href="#books" className="hover:text-primary transition-colors">
                  {t('nav.books')}
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-primary transition-colors">
                  {t('nav.about')}
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-primary transition-colors">
                  {t('nav.contact')}
                </a>
              </li>
            </ul>
          </div>

          {/* Settings */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.settings', 'Settings')}</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {theme === 'dark' ? t('footer.lightMode', 'Light') : t('footer.darkMode', 'Dark')} {t('footer.mode', 'Mode')}
                </span>
              </div>
              <div>
                <label htmlFor="language-select" className="sr-only">{t('footer.selectLanguage', 'Select Language')}</label>
                <select
                  id="language-select"
                  value={currentLanguage}
                  onChange={(e) => changeLanguage(e.target.value as any)}
                  className="bg-background border border-border rounded-lg px-3 py-2 text-sm"
                >
                  {(Object.keys(languages) as any[]).map((lang) => (
                    <option key={lang} value={lang}>
                      {languages[lang].flag} {languages[lang].name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>{t('footer.copyright')}</p>
          <p className="flex items-center gap-1">
            {t('footer.madeWith', 'Made with')} <Heart className="w-4 h-4 text-primary fill-primary" /> {t('footer.forReaders', 'for readers worldwide')}
          </p>
        </div>
      </div>
    </footer>
  );
}
