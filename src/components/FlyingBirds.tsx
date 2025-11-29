import { cn } from '@/lib/utils';

interface BirdProps {
  className?: string;
  delay?: number;
  duration?: number;
  path?: 'diagonal' | 'horizontal' | 'arc';
}

// Simple cute bird SVG
function BirdIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Bird body */}
      <ellipse cx="12" cy="14" rx="6" ry="5" fill="currentColor" opacity="0.8" />
      {/* Bird head */}
      <circle cx="8" cy="12" r="3" fill="currentColor" opacity="0.9" />
      {/* Beak */}
      <path d="M5 12 L3 11 L3 13 Z" fill="currentColor" opacity="0.9" />
      {/* Wing */}
      <ellipse cx="10" cy="14" rx="3" ry="2" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

export function FlyingBird({ className, delay = 0, duration = 20, path = 'diagonal' }: BirdProps) {
  const pathClass = {
    diagonal: 'animate-fly-diagonal',
    horizontal: 'animate-fly-horizontal',
    arc: 'animate-fly-arc',
  }[path];

  return (
    <div
      className={cn(
        'absolute pointer-events-none opacity-40',
        pathClass,
        className
      )}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      <BirdIcon className="w-6 h-6 text-gentle" />
    </div>
  );
}

export function FlyingBirds() {
  return (
    <>
      {/* Bird 1 - Diagonal top-left to bottom-right */}
      <FlyingBird
        path="diagonal"
        delay={0}
        duration={25}
        className="top-[10%] left-[-20px]"
      />
      
      {/* Bird 2 - Horizontal left to right */}
      <FlyingBird
        path="horizontal"
        delay={3}
        duration={30}
        className="top-[20%] left-[-20px]"
      />
      
      {/* Bird 3 - Arc path */}
      <FlyingBird
        path="arc"
        delay={6}
        duration={28}
        className="top-[30%] left-[-20px]"
      />
      
      {/* Bird 4 - Diagonal bottom-left to top-right */}
      <FlyingBird
        path="diagonal"
        delay={9}
        duration={32}
        className="bottom-[25%] left-[-20px]"
      />
      
      {/* Bird 5 - Horizontal right to left */}
      <FlyingBird
        path="horizontal"
        delay={12}
        duration={27}
        className="top-[15%] right-[-20px]"
      />
    </>
  );
}

