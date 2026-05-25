import { useEffect, useState } from 'react';

const COLORS = ['#e94560', '#00ff88', '#ffd700', '#00d9ff', '#ff6b6b', '#a855f7', '#f472b6'];

function random(min, max) {
  return Math.random() * (max - min) + min;
}

export default function Confetti({ active, duration = 3000 }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const newParticles = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: random(0, 100),
      y: random(-20, -5),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: random(6, 14),
      rotation: random(0, 360),
      speedX: random(-3, 3),
      speedY: random(2, 6),
      rotationSpeed: random(-10, 10),
      delay: random(0, 500),
    }));

    setParticles(newParticles);

    const timer = setTimeout(() => setParticles([]), duration);
    return () => clearTimeout(timer);
  }, [active, duration]);

  if (particles.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 999,
      overflow: 'hidden'
    }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `confetti-fall ${random(2, 4)}s ease-out ${p.delay}ms forwards`,
            opacity: 0,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
