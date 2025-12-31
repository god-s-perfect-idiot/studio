'use client';

import React, { useState, useEffect, memo } from 'react';

const confettiColors = [
  '#87CEEB', // primary
  '#66CDAA', // accent
  '#FFD700', // gold
  '#FF69B4', // hotpink
  '#FFFFFF', // white
];
const confettiCount = 150;

type ConfettiParticle = {
  id: number;
  style: React.CSSProperties;
};

const Confetti = () => {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: confettiCount }).map((_, index) => ({
      id: index,
      style: {
        '--color': confettiColors[index % confettiColors.length],
        left: `${Math.random() * 100}vw`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${Math.random() * 2 + 3}s`,
        transform: `rotate(${Math.random() * 360}deg)`,
      } as React.CSSProperties,
    }));
    setParticles(newParticles);
  }, []);

  if (particles.length === 0) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute top-[-10px] h-4 w-2 animate-confetti-fall rounded-full bg-[var(--color)]"
          style={particle.style}
        />
      ))}
    </div>
  );
};

export default memo(Confetti);
