import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { LandingPage } from './pages/LandingPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <LanguageProvider>
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
