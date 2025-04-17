import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  speed: number;
  opacity: number;
}

export function ConfettiEffect() {
  const [particles, setParticles] = useState<Particle[]>([]);
  
  useEffect(() => {
    // Create confetti particles
    const colors = ['#FFD23F', '#4C6FFF', '#FF4C6F', '#6FFF4C', '#FF6F4C'];
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < 100; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * 100, // Start above the viewport
        size: 5 + Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        speed: 2 + Math.random() * 4,
        opacity: 0.8 + Math.random() * 0.2
      });
    }
    
    setParticles(newParticles);
    
    // Animate particles
    const interval = setInterval(() => {
      setParticles(prevParticles => 
        prevParticles.map(particle => {
          // Move particle down
          const y = particle.y + particle.speed;
          
          // If particle is out of viewport, reset it to the top
          if (y > window.innerHeight) {
            return {
              ...particle,
              y: -20,
              x: Math.random() * window.innerWidth,
              opacity: particle.opacity - 0.05
            };
          }
          
          // Otherwise, update its position
          return {
            ...particle,
            y,
            rotation: particle.rotation + 1
          };
        }).filter(particle => particle.opacity > 0) // Remove faded particles
      );
    }, 30);
    
    // Clean up
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            opacity: particle.opacity,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%'
          }}
        />
      ))}
    </div>
  );
}
