import { useData } from '../contexts/DataContext';
import { CheckCircle2, RefreshCw, AlertCircle, WifiOff } from 'lucide-react';

export default function SyncIndicator() {
  const { syncStatus } = useData();

  const getStatusConfig = () => {
    switch (syncStatus) {
      case 'synced':
        return { icon: <CheckCircle2 size={14} color="#10b981" />, text: 'Synced' };
      case 'syncing':
        return { icon: <RefreshCw size={14} color="var(--accent)" className="animate-spin" />, text: 'Syncing...' };
      case 'error':
        return { icon: <AlertCircle size={14} color="#f59e0b" />, text: 'Sync Error' };
      case 'offline':
        return { icon: <WifiOff size={14} color="var(--text-tertiary)" />, text: 'Offline' };
      default:
        return { icon: <CheckCircle2 size={14} color="#10b981" />, text: 'Synced' };
    }
  };

  const { icon, text } = getStatusConfig();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
      {icon} {text}
    </div>
  );
}
