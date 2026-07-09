import { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { format, subDays, isAfter, startOfDay, endOfDay } from 'date-fns';
import { Timer, Coffee, CheckCircle2 } from 'lucide-react';

export default function FocusSummary() {
  const { timeLogs, tasks, subjects } = useData();
  const [timeframe, setTimeframe] = useState('today'); // 'today' | 'week'

  const { filteredLogs, totalWorkTime, totalBreakTime, categoryData } = useMemo(() => {
    const logs = timeLogs || [];
    const now = new Date();
    
    // Determine the date range based on timeframe
    const startDate = timeframe === 'today' 
      ? startOfDay(now) 
      : startOfDay(subDays(now, 6)); // Last 7 days including today
      
    const endDate = endOfDay(now);

    const relevantLogs = logs.filter(log => {
      if (!log.startedAt) return false;
      const logDate = new Date(log.startedAt);
      return isAfter(logDate, startDate) && logDate <= endDate;
    });

    let workTime = 0;
    let breakTime = 0;
    
    // Map to group by category (subject)
    const categoryMap = new Map(); // subjectId -> duration
    
    relevantLogs.forEach(log => {
      if (log.isBreak || log.taskId === 'break') {
        breakTime += log.duration;
      } else {
        workTime += log.duration;
        
        // Find task to get subject
        const task = tasks.find(t => t.id === log.taskId);
        if (task && task.subjectId) {
          const current = categoryMap.get(task.subjectId) || 0;
          categoryMap.set(task.subjectId, current + log.duration);
        } else {
          // Uncategorized
          const current = categoryMap.get('uncategorized') || 0;
          categoryMap.set('uncategorized', current + log.duration);
        }
      }
    });
    
    // Format category data for the UI
    const totalTime = workTime + breakTime;
    let formattedCategories = [];
    
    categoryMap.forEach((duration, subjectId) => {
      if (duration === 0) return;
      
      let subjectName = 'General';
      let subjectColor = '#94a3b8'; // default gray
      
      if (subjectId !== 'uncategorized') {
        const subject = subjects.find(s => s.id === subjectId);
        if (subject) {
          subjectName = subject.name;
          subjectColor = subject.color;
        }
      }
      
      formattedCategories.push({
        id: subjectId,
        name: subjectName,
        color: subjectColor,
        duration,
        ratio: totalTime > 0 ? Math.round((duration / totalTime) * 100) : 0
      });
    });
    
    // Add break as a category if it exists
    if (breakTime > 0) {
      formattedCategories.push({
        id: 'break',
        name: 'Break',
        color: '#94a3b8', // Gray for break
        duration: breakTime,
        ratio: totalTime > 0 ? Math.round((breakTime / totalTime) * 100) : 0
      });
    }
    
    // Sort by duration descending
    formattedCategories.sort((a, b) => b.duration - a.duration);
    
    return {
      filteredLogs: relevantLogs,
      totalWorkTime: workTime,
      totalBreakTime: breakTime,
      categoryData: formattedCategories
    };
  }, [timeLogs, tasks, subjects, timeframe]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0 && m > 0) return `${h}h ${m}min`;
    if (h > 0) return `${h}h`;
    return `${m}min`;
  };

  return (
    <div className="focus-summary-container" style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 style={{ margin: 0 }}>Summary Insights</h2>
        
        <div style={{ 
          display: 'flex', 
          backgroundColor: 'var(--bg-tertiary)', 
          borderRadius: 'var(--radius-full)', 
          padding: '4px' 
        }}>
          <button 
            className={`btn ${timeframe === 'today' ? 'active' : ''}`}
            style={{ 
              backgroundColor: timeframe === 'today' ? 'var(--bg-primary)' : 'transparent',
              boxShadow: timeframe === 'today' ? 'var(--shadow-sm)' : 'none',
              borderRadius: 'var(--radius-full)',
              padding: '6px 16px',
              border: 'none',
              fontWeight: timeframe === 'today' ? 600 : 500,
              color: timeframe === 'today' ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
            onClick={() => setTimeframe('today')}
          >
            Today
          </button>
          <button 
            className={`btn ${timeframe === 'week' ? 'active' : ''}`}
            style={{ 
              backgroundColor: timeframe === 'week' ? 'var(--bg-primary)' : 'transparent',
              boxShadow: timeframe === 'week' ? 'var(--shadow-sm)' : 'none',
              borderRadius: 'var(--radius-full)',
              padding: '6px 16px',
              border: 'none',
              fontWeight: timeframe === 'week' ? 600 : 500,
              color: timeframe === 'week' ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
            onClick={() => setTimeframe('week')}
          >
            This Week
          </button>
        </div>
      </div>
      
      {/* High Level Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
        <div style={{ 
          backgroundColor: 'var(--bg-secondary)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '24px',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '16px', fontWeight: 500 }}>
            <Timer size={20} color="var(--accent)" />
            Total Focus
          </div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {formatTime(totalWorkTime)}
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: 'var(--bg-secondary)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '24px',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '16px', fontWeight: 500 }}>
            <Coffee size={20} color="var(--subject-geography)" />
            Total Break
          </div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {formatTime(totalBreakTime)}
          </div>
        </div>
      </div>
      
      {/* Category Distribution */}
      <div style={{ 
        backgroundColor: 'var(--bg-secondary)', 
        borderRadius: 'var(--radius-lg)', 
        padding: '32px',
        border: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.5px' }}>
            CATEGORY
          </h3>
          <div style={{ display: 'flex', gap: '32px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.5px' }}>
            <span style={{ width: '60px', textAlign: 'right' }}>RATIO</span>
            <span style={{ width: '80px', textAlign: 'right' }}>TIME SPENT</span>
          </div>
        </div>
        
        {categoryData.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            No sessions recorded for {timeframe === 'today' ? 'today' : 'this week'}.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {categoryData.map(category => (
              <div key={category.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%', 
                      border: '2px solid var(--border)',
                      color: 'var(--border)'
                    }}>
                      <CheckCircle2 size={16} />
                    </div>
                    <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {category.name}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                    <span style={{ width: '60px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {category.ratio}%
                    </span>
                    <span style={{ width: '80px', textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatTime(category.duration)}
                    </span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div style={{ 
                  width: '100%', 
                  height: '6px', 
                  backgroundColor: 'var(--bg-tertiary)', 
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${category.ratio}%`,
                    height: '100%',
                    backgroundColor: category.color,
                    borderRadius: '3px',
                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
