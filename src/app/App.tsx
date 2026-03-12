import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { LandingPage } from './pages/LandingPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { SplashScreen } from './components/SplashScreen';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setShowSplash(isStandalone);
  }, []);

  return (
    <Router>
      <ThemeProvider>
        <LanguageProvider>
          {showSplash && <SplashScreen />}
          <Toaster />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Routes>
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  );
}
