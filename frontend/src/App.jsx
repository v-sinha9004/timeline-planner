import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataProvider } from './contexts/DataContext';
import Sidebar from './components/Layout/Sidebar';
import TopBar from './components/Layout/TopBar';
import TodayView from './pages/TodayView';
import WeeklyView from './pages/WeeklyView';
import MonthlyView from './pages/MonthlyView';
import AllTasksView from './pages/AllTasksView';
import SubjectsView from './pages/SubjectsView';

function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <BrowserRouter>
          <div className="app-container">
            <Sidebar />
            <div className="main-content">
              <TopBar />
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
    </ThemeProvider>
  );
}

export default App;
