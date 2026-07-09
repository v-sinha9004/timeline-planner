export default function ConfettiOverlay({ show }) {
  if (!show) return null;

  return (
    <>
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="confetti"
          style={{
            left: `${Math.random() * 100}vw`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${1 + Math.random() * 2}s`,
            backgroundColor: ['#e8507a', '#f59e0b', '#38bdf8', '#84cc16'][Math.floor(Math.random() * 4)],
            width: `${5 + Math.random() * 10}px`,
            height: `${5 + Math.random() * 10}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0'
          }}
        />
      ))}
    </>
  );
}
