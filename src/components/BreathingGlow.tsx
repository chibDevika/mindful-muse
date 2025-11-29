import { cn } from '@/lib/utils';

interface BreathingGlowProps {
  className?: string;
}

export function BreathingGlow({ className }: BreathingGlowProps) {
  return (
    <div
      className={cn(
        "pointer-events-none relative",
        className
      )}
      aria-hidden="true"
      style={{ 
        width: 900, 
        height: 900,
        overflow: 'visible',
        margin: '-200px'
      }}
    >
      <svg 
        viewBox="0 0 600 600" 
        preserveAspectRatio="xMidYMid meet" 
        className="w-full h-full will-change-transform"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <radialGradient id="breathingGlowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F5E4D4" stopOpacity="0.6" />
            <stop offset="20%" stopColor="#F0DCC8" stopOpacity="0.5" />
            <stop offset="40%" stopColor="#EBD4BC" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#E6CCB0" stopOpacity="0.3" />
            <stop offset="80%" stopColor="#E1C4A4" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#F5E4D4" stopOpacity="0" />
          </radialGradient>
          <filter id="breathingSoftBlur">
            <feGaussianBlur stdDeviation="40" result="blur" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 1.2 0"
            />
          </filter>
        </defs>

        <g filter="url(#breathingSoftBlur)" style={{ overflow: 'visible' }}>
          <circle
            cx="300"
            cy="300"
            r="250"
            fill="url(#breathingGlowGrad)"
            className="breathing-glow-ellipse"
          />
        </g>
      </svg>
    </div>
  );
}

