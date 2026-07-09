export default function SubjectBadge({ subject, size = 'md' }) {
  if (!subject) return null;

  const hex2rgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  };

  const bgColor = `rgba(${hex2rgb(subject.color)}, 0.15)`;
  const padding = size === 'sm' ? '2px 6px' : '2px 8px';
  const fontSize = size === 'sm' ? '11px' : '13px';

  return (
    <div 
      className="subject-badge" 
      style={{ 
        backgroundColor: bgColor, 
        color: subject.color,
        padding,
        fontSize
      }}
    >
      <span>{subject.icon}</span>
      <span>{subject.name}</span>
    </div>
  );
}
