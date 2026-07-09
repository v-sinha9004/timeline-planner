import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

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

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('upsc-planner-data');
    if (saved) {
      dispatch({ type: 'SET_STATE', payload: JSON.parse(saved) });
    } else {
      dispatch({ type: 'SET_STATE', payload: { subjects: DEFAULT_SUBJECTS } });
    }
    // Note: Lazy Supabase sync to be implemented here
  }, []);

  // Save to localStorage on state change (debounce for sync)
  useEffect(() => {
    if (state.subjects.length > 0 || state.tasks.length > 0) {
      const stateToSave = {
        subjects: state.subjects,
        tasks: state.tasks,
        timeLogs: state.timeLogs
      };
      localStorage.setItem('upsc-planner-data', JSON.stringify(stateToSave));
      
      // Simulate debounced sync
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'syncing' });
      const timer = setTimeout(() => {
        dispatch({ type: 'SET_SYNC_STATUS', payload: 'synced' });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.subjects, state.tasks, state.timeLogs]);

  // Actions
  const addTask = useCallback((task) => {
    dispatch({ type: 'ADD_TASK', payload: { ...task, id: crypto.randomUUID(), createdAt: new Date().toISOString() } });
  }, []);

  const updateTask = useCallback((id, updates) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
  }, []);

  const deleteTask = useCallback((id) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  }, []);

  const addTimeLog = useCallback((log) => {
    dispatch({ type: 'ADD_TIMELOG', payload: { ...log, id: crypto.randomUUID(), createdAt: new Date().toISOString() } });
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
