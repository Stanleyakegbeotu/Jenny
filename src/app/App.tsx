import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { LandingPage } from './pages/LandingPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { LoadingPage } from './components/LoadingPage';

export default function App() {
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    // Show loading screen for 3 seconds on initial app boot only
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <ThemeProvider>
        <LanguageProvider>
          {showLoading && <LoadingPage />}
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
