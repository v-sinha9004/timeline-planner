import { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { useUser } from './UserContext';

const DataContext = createContext();

const API_BASE = 'http://localhost:5002';

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
  subjects: DEFAULT_SUBJECTS,
  tasks: [],
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
    case 'ADD_MULTIPLE_TASKS':
      return { ...state, tasks: [...state.tasks, ...action.payload] };
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
    default:
      return state;
  }
}

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  const { activeUser } = useUser();

  // Initial Data Load & Fetch
  useEffect(() => {
    // 1. Load from localStorage
    const savedData = localStorage.getItem(`upsc-planner-data-${activeUser}`);
    if (savedData) {
      const { subjects, tasks } = JSON.parse(savedData);
      dispatch({ type: 'SET_STATE', payload: { subjects, tasks } });
    } else {
      // Clear tasks if switching to a user with no local data yet, so we don't show previous user's tasks while fetching
      dispatch({ type: 'SET_STATE', payload: { tasks: [] } });
    }

    // 2. Fetch fresh from DB asynchronously
    dispatch({ type: 'SET_SYNC_STATUS', payload: 'fetching' });

    Promise.all([
      fetch(`${API_BASE}/api/subjects`).then(res => res.json()).catch(() => null),
      fetch(`${API_BASE}/api/tasks?owner=${activeUser}`).then(res => res.json()).catch(() => null),
    ]).then(([subjects, tasks]) => {
      let isOffline = false;
      const updates = {};

      if (subjects && Array.isArray(subjects)) {
        updates.subjects = subjects;
      } else if (subjects === null) {
        isOffline = true;
      }

      if (tasks && Array.isArray(tasks)) {
        // Normalize dates from backend (ISO strings) to local yyyy-MM-dd
        updates.tasks = tasks.map(t => ({
          ...t,
          date: t.date ? t.date.substring(0, 10) : null,
          startDate: t.startDate ? t.startDate.substring(0, 10) : null,
          endDate: t.endDate ? t.endDate.substring(0, 10) : null,
        }));
      } else if (tasks === null) {
        isOffline = true;
      }

      if (Object.keys(updates).length > 0) {
        dispatch({ type: 'SET_STATE', payload: updates });
      }

      dispatch({ type: 'SET_SYNC_STATUS', payload: isOffline ? 'offline' : 'synced' });
    });
  }, [activeUser]);

  // Save changes to localStorage
  useEffect(() => {
    if (state.subjects.length > 0 || state.tasks.length > 0) {
      const stateToSave = {
        subjects: state.subjects,
        tasks: state.tasks
      };
      localStorage.setItem(`upsc-planner-data-${activeUser}`, JSON.stringify(stateToSave));
    }
  }, [state.subjects, state.tasks, activeUser]);

  // Actions
  const addTask = useCallback(async (task) => {
    const newTask = { ...task, id: crypto.randomUUID(), createdAt: new Date().toISOString(), owner: activeUser };
    dispatch({ type: 'ADD_TASK', payload: newTask });

    try {
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'syncing' });
      await fetch(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'synced' });
    } catch (err) {
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'error' });
      console.error('Failed to save task to server:', err);
    }
  }, [activeUser]);

  const addMultipleTasks = useCallback(async (tasksArray) => {
    const newTasks = tasksArray.map(task => ({
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      owner: activeUser
    }));

    dispatch({ type: 'ADD_MULTIPLE_TASKS', payload: newTasks });

    try {
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'syncing' });
      await fetch(`${API_BASE}/api/tasks/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: newTasks })
      });
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'synced' });
    } catch (err) {
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'error' });
      console.error('Failed to save multiple tasks to server:', err);
    }
  }, [activeUser]);

  const updateTask = useCallback(async (id, updates) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });

    try {
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'syncing' });
      await fetch(`${API_BASE}/api/tasks/${id}`, {
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
      await fetch(`${API_BASE}/api/tasks/${id}`, { method: 'DELETE' });
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'synced' });
    } catch (err) {
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'error' });
      console.error('Failed to delete task on server:', err);
    }
  }, []);

  const addSubject = useCallback(async (subject) => {
    const newSubject = { ...subject, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    dispatch({ type: 'ADD_SUBJECT', payload: newSubject });

    try {
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'syncing' });
      await fetch(`${API_BASE}/api/subjects`, {
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
      await fetch(`${API_BASE}/api/subjects/${id}`, {
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
      await fetch(`${API_BASE}/api/subjects/${id}`, { method: 'DELETE' });
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
      // Skip this task on excluded dates
      if ((t.excludedDates || []).includes(dateStr)) return false;

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
    addMultipleTasks,
    updateTask,
    deleteTask,
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
