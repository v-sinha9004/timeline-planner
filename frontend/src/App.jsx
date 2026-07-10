import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import { DataProvider } from './contexts/DataContext';
import Sidebar from './components/Layout/Sidebar';
import TopBar from './components/Layout/TopBar';
import TodayView from './pages/TodayView';
import WeeklyView from './pages/WeeklyView';
import MonthlyView from './pages/MonthlyView';
import AllTasksView from './pages/AllTasksView';
import SubjectsView from './pages/SubjectsView';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ThemeProvider>
      <UserProvider>
        <DataProvider>
          <BrowserRouter>
            <div className="app-container">
              <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
              <div className="main-content">
                <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
                <div className="page-content">
                  <Routes>
                    <Route path="/" element={<TodayView />} />
                    <Route path="/weekly" element={<WeeklyView />} />
                    <Route path="/monthly" element={<MonthlyView />} />
                    <Route path="/tasks" element={<AllTasksView />} />
                    <Route path="/subjects" element={<SubjectsView />} />
                  </Routes>
                </div>
              </div>
            </div>
          </BrowserRouter>
        </DataProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
