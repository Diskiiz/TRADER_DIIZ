import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { TopAppBar, BottomNavigation, BottomNavigationItem } from '@serendie/ui';
import { SerendieSymbol } from '@serendie/symbols';
import './App.css';
import HomePage from './pages/HomePage';
import HistoryPage from './pages/HistoryPage';
import ReportPage from './pages/ReportPage';
import NewsPage from './pages/NewsPage';
import { initWithMockDataIfEmpty } from './utils/storage';
import { initAntennasIfEmpty } from './utils/antennaStorage';
import { mockDecisions } from './data/mockDecisions';

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    initWithMockDataIfEmpty(mockDecisions);
    initAntennasIfEmpty();
  }, []);

  return (
    <div className="app-layout">
      <TopAppBar type="navbar" title="TRADER DIIZ" />
      <main className="app-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/report" element={<ReportPage />} />
        </Routes>
      </main>
      <BottomNavigation className="app-bottom-nav">
        <BottomNavigationItem
          icon={<SerendieSymbol name="home" variant="outlined" />}
          label="今日の判断"
          isActive={location.pathname === '/'}
          onClick={() => navigate('/')}
        />
        <BottomNavigationItem
          icon={<SerendieSymbol name="article" variant="outlined" />}
          label="ニュース"
          isActive={location.pathname === '/news'}
          onClick={() => navigate('/news')}
        />
        <BottomNavigationItem
          icon={<SerendieSymbol name="history" variant="outlined" />}
          label="履歴"
          isActive={location.pathname === '/history'}
          onClick={() => navigate('/history')}
        />
        <BottomNavigationItem
          icon={<SerendieSymbol name="pie-chart" variant="outlined" />}
          label="レポート"
          isActive={location.pathname === '/report'}
          onClick={() => navigate('/report')}
        />
      </BottomNavigation>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
