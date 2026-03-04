import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { LandingPage } from './pages/LandingPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { LoadingPage } from './components/LoadingPage';

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <LanguageProvider>
          <LoadingPage />
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
