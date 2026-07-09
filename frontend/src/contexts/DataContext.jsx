import { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';

const DataContext = createContext();

const DEFAULT_SUBJECTS = [
  { id: 'subj-history-001', name: 'Indian History', color: '#f59e0b', icon: '📜', order: 0, subtopics: [] },
  { id: 'subj-geography-001', name: 'Geography', color: '#84cc16', icon: '🌍', order: 1, subtopics: [] },
  { id: 'subj-polity-001', name: 'Indian Polity', color: '#38bdf8', icon: '⚖️', order: 2, subtopics: [] },
  { id: 'subj-economy-001', name: 'Economy', color: '#a78bfa', icon: '💰', order: 3, subtopics: [] },
  { id: 'subj-science-001', name: 'Science & Tech', color: '#fb923c', icon: '🔬', order: 4, subtopics: [] },
  { id: 'subj-ethics-001', name: 'Ethics', color: '#f472b6', icon: '🧭', order: 5, subtopics: [] },
  { id: 'subj-essay-001', name: 'Essay', color: '#a3866a', icon: '✍️', order: 6, subtopics: [] },
  { id: 'subj-csat-001', name: 'CSAT', color: '#2dd4bf', icon: '🧠', order: 7, subtopics: [] },
  { id: 'subj-current-affairs-001', name: 'Current Affairs', color: '#f87171', icon: '📰', order: 8, subtopics: [] },
  { id: 'subj-governance-001', name: 'Governance', color: '#6366f1', icon: '🏛️', order: 9, subtopics: [] },
  { id: 'subj-anthropology-001', name: 'Anthropology', color: '#ec4899', icon: '👥', order: 10, subtopics: [] },
  { id: 'subj-internal-security-001', name: 'Internal Security', color: '#64748b', icon: '🛡️', order: 11, subtopics: [] },
  { id: 'subj-amac-001', name: 'AMAC', color: '#d97706', icon: '🏺', order: 12, subtopics: [] },
  { id: 'subj-world-history-001', name: 'World History', color: '#14b8a6', icon: '🗺️', order: 13, subtopics: [] },
  { id: 'subj-society-001', name: 'Society', color: '#eab308', icon: '🤝', order: 14, subtopics: [] },
  { id: 'subj-social-justice-001', name: 'Social Justice', color: '#8b5cf6', icon: '✊', order: 15, subtopics: [] },
  { id: 'subj-ir-001', name: 'International Relations', color: '#0ea5e9', icon: '🌐', order: 16, subtopics: [] },
  { id: 'subj-environment-001', name: 'Environment', color: '#22c55e', icon: '🌱', order: 17, subtopics: [] },
  { id: 'subj-disaster-mgmt-001', name: 'Disaster Management', color: '#ef4444', icon: '🌪️', order: 18, subtopics: [] },
];

const initialState = {
  subjects: [],
  tasks: [],
  timeLogs: [],
  syncStatus: 'synced', // 'synced' | 'syncing' | 'offline' | 'error'
};

function dataReducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'SET_SYNC_STATUS':
      return { ...state, syncStatus: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id ? { ...t, ...action.payload.updates } : t)
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
    case 'ADD_SUBJECT':
      return { ...state, subjects: [...state.subjects, action.payload] };
    case 'UPDATE_SUBJECT':
      return {
        ...state,
        subjects: state.subjects.map(s => s.id === action.payload.id ? { ...s, ...action.payload.updates } : s)
      };
    case 'DELETE_SUBJECT':
      return { ...state, subjects: state.subjects.filter(s => s.id !== action.payload) };
    case 'ADD_TIMELOG':
      return { ...state, timeLogs: [...state.timeLogs, action.payload] };
    default:
      return state;
  }
}

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  const isFirstRenderSubjects = useRef(true);
  const isFirstRenderTasks = useRef(true);
  const isFirstRenderTimeLogs = useRef(true);

  // Initial Data Load & Fetch
  useEffect(() => {
    // 1. Load from localStorage
    const savedSubjects = localStorage.getItem('upsc-planner-subjects');
    const savedTasks = localStorage.getItem('upsc-planner-tasks');
    const savedTimeLogs = localStorage.getItem('upsc-planner-timelogs');

    const subjectsToLoad = savedSubjects ? JSON.parse(savedSubjects) : DEFAULT_SUBJECTS;
    const tasksToLoad = savedTasks ? JSON.parse(savedTasks) : [];
    const timeLogsToLoad = savedTimeLogs ? JSON.parse(savedTimeLogs) : [];

    dispatch({ 
      type: 'SET_STATE', 
      payload: { 
        subjects: subjectsToLoad, 
        tasks: tasksToLoad, 
        timeLogs: timeLogsToLoad 
      } 
    });

    // 2. Fetch fresh from DB asynchronously
    dispatch({ type: 'SET_SYNC_STATUS', payload: 'syncing' });

    Promise.all([
      fetch('/api/subjects').then(res => res.json()).catch(() => null),
      fetch('/api/tasks').then(res => res.json()).catch(() => null),
      fetch('/api/timelogs').then(res => res.json()).catch(() => null)
    ]).then(([subjects, tasks, timeLogs]) => {
      let isOffline = false;
      const updates = {};

      if (subjects && Array.isArray(subjects)) {
        updates.subjects = subjects;
        localStorage.setItem('upsc-planner-subjects', JSON.stringify(subjects));
      } else if (subjects === null) {
        isOffline = true;
      }

      if (tasks && Array.isArray(tasks)) {
        // Normalize dates from backend
        updates.tasks = tasks.map(t => ({
          ...t,
          date: t.date ? t.date.substring(0, 10) : null,
          startDate: t.startDate ? t.startDate.substring(0, 10) : null,
          endDate: t.endDate ? t.endDate.substring(0, 10) : null,
        }));
        localStorage.setItem('upsc-planner-tasks', JSON.stringify(updates.tasks));
      } else if (tasks === null) {
        isOffline = true;
      }

      if (timeLogs && Array.isArray(timeLogs)) {
        updates.timeLogs = timeLogs.map(log => ({
          ...log,
          date: log.date ? log.date.substring(0, 10) : null,
        }));
        localStorage.setItem('upsc-planner-timelogs', JSON.stringify(updates.timeLogs));
      } else if (timeLogs === null) {
        isOffline = true;
      }

      if (Object.keys(updates).length > 0) {
        dispatch({ type: 'SET_STATE', payload: updates });
      }
      
      dispatch({ type: 'SET_SYNC_STATUS', payload: isOffline ? 'offline' : 'synced' });
    });
  }, []);

  // Save changes to localStorage immediately on update
  useEffect(() => {
    if (isFirstRenderSubjects.current) {
      isFirstRenderSubjects.current = false;
      return;
    }
    localStorage.setItem('upsc-planner-subjects', JSON.stringify(state.subjects));
  }, [state.subjects]);

  useEffect(() => {
    if (isFirstRenderTasks.current) {
      isFirstRenderTasks.current = false;
      return;
    }
    localStorage.setItem('upsc-planner-tasks', JSON.stringify(state.tasks));
  }, [state.tasks]);

  useEffect(() => {
    if (isFirstRenderTimeLogs.current) {
      isFirstRenderTimeLogs.current = false;
      return;
    }
    localStorage.setItem('upsc-planner-timelogs', JSON.stringify(state.timeLogs));
  }, [state.timeLogs]);

  // Actions - Optimistic updates followed by API calls
  const addTask = useCallback(async (task) => {
    const newTask = { ...task, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    dispatch({ type: 'ADD_TASK', payload: newTask });
    
    try {
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'syncing' });
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'synced' });
    } catch (err) {
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'error' });
      console.error('Failed to save task to server:', err);
    }
  }, []);

  const updateTask = useCallback(async (id, updates) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
    
    try {
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'syncing' });
      await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'synced' });
    } catch (err) {
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'error' });
      console.error('Failed to update task on server:', err);
    }
  }, []);

  const deleteTask = useCallback(async (id) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
    
    try {
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'syncing' });
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'synced' });
    } catch (err) {
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'error' });
      console.error('Failed to delete task on server:', err);
    }
  }, []);

  const addTimeLog = useCallback(async (log) => {
    const newLog = { ...log, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    dispatch({ type: 'ADD_TIMELOG', payload: newLog });
    
    try {
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'syncing' });
      await fetch('/api/timelogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog)
      });
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'synced' });
    } catch (err) {
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'error' });
      console.error('Failed to save time log to server:', err);
    }
  }, []);

  const addSubject = useCallback(async (subject) => {
    const newSubject = { ...subject, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    dispatch({ type: 'ADD_SUBJECT', payload: newSubject });
    
    try {
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'syncing' });
      await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubject)
      });
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'synced' });
    } catch (err) {
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'error' });
      console.error('Failed to save subject to server:', err);
    }
  }, []);

  const updateSubject = useCallback(async (id, updates) => {
    dispatch({ type: 'UPDATE_SUBJECT', payload: { id, updates } });
    
    try {
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'syncing' });
      await fetch(`/api/subjects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'synced' });
    } catch (err) {
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'error' });
      console.error('Failed to update subject on server:', err);
    }
  }, []);

  const deleteSubject = useCallback(async (id) => {
    dispatch({ type: 'DELETE_SUBJECT', payload: id });
    
    try {
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'syncing' });
      await fetch(`/api/subjects/${id}`, { method: 'DELETE' });
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'synced' });
    } catch (err) {
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'error' });
      console.error('Failed to delete subject on server:', err);
    }
  }, []);

  // Selectors
  const getSubjectById = useCallback((id) => {
    return state.subjects.find(s => s.id === id) || null;
  }, [state.subjects]);

  const getTasksForDate = useCallback((dateStr) => {
    return state.tasks.filter(t => {
      const taskStart = t.startDate || t.date;
      const taskEnd = t.endDate || t.date;
      if (!taskStart && !taskEnd) return false;
      if (taskStart && taskEnd) return dateStr >= taskStart && dateStr <= taskEnd;
      if (taskStart) return dateStr >= taskStart;
      if (taskEnd) return dateStr <= taskEnd;
      return false;
    });
  }, [state.tasks]);

  const value = {
    ...state,
    addTask,
    updateTask,
    deleteTask,
    addTimeLog,
    addSubject,
    updateSubject,
    deleteSubject,
    getSubjectById,
    getTasksForDate
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
