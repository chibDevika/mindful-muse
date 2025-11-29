import { cn } from '@/lib/utils';

interface LeafProps {
  delay?: number;
  duration?: number;
  startX?: number;
  layer?: number;
  size?: number;
  startY?: number;
}

// Realistic autumn leaf SVG shape
function LeafIcon({ className, size = 20 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Maple/autumn leaf shape */}
      <path
        d="M12 2 C10 3, 8 5, 7 7 C6 9, 5 11, 5 13 C5 15, 6 17, 7 18 C8 19, 10 20, 12 21 C14 20, 16 19, 17 18 C18 17, 19 15, 19 13 C19 11, 18 9, 17 7 C16 5, 14 3, 12 2 Z"
        fill="currentColor"
        opacity="0.8"
      />
      {/* Leaf stem */}
      <path
        d="M12 2 L12 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Main vein */}
      <path
        d="M12 4 L12 18"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.4"
        strokeLinecap="round"
      />
      {/* Side veins */}
      <path
        d="M12 8 L9 10 M12 10 L8 12 M12 12 L8 15 M12 14 L9 16 M12 10 L15 12 M12 12 L16 15 M12 14 L15 16"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FloatingLeaf({ delay = 0, duration = 12, startX = 50, layer = 1, size = 20 }: LeafProps) {
  // Calculate swaying horizontal offset (S-curve) based on layer
  const horizontalOffset = layer === 1 ? 40 : layer === 2 ? 60 : 80;
  const rotation = Math.random() * 360;
  
  // Autumn colors - oranges, reds, yellows, browns
  const autumnColors = [
    'hsl(25 70% 55% / 0.7)',  // Orange
    'hsl(15 75% 50% / 0.7)',  // Red-orange
    'hsl(45 80% 60% / 0.7)',  // Golden yellow
    'hsl(30 60% 45% / 0.7)',  // Burnt orange
    'hsl(20 50% 40% / 0.7)',  // Brown
    'hsl(10 70% 55% / 0.7)',  // Red
  ];
  const color = autumnColors[Math.floor(Math.random() * autumnColors.length)];

  return (
    <div
      className="absolute pointer-events-none animate-fall-leaf"
      style={{
        left: `${startX}%`,
        top: '-40px',
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        '--leaf-horizontal': `${horizontalOffset}px`,
        '--leaf-rotation': `${rotation}deg`,
        color: color,
      } as React.CSSProperties}
    >
      <LeafIcon size={size} />
    </div>
  );
}

export function FloatingLeaves() {
  // Generate fewer leaves - 1-2 at a time with randomized properties
  const leaves: Array<{ delay: number; duration: number; startX: number; layer: number; size: number }> = [];
  
  // Create leaves that spawn every 2-4s, 1-2 at a time
  let currentDelay = 0;
  const totalLeaves = 8; // Reduced number for calmer effect
  
  for (let i = 0; i < totalLeaves; i++) {
    // Spawn 1-2 leaves per spawn interval
    const leavesPerSpawn = Math.floor(Math.random() * 2) + 1; // 1 or 2
    
    for (let j = 0; j < leavesPerSpawn && i < totalLeaves; j++) {
      // Duration: 12-20s (slower for more fluid motion)
      const duration = 12 + Math.random() * 8;
      
      // Start position: spread across screen
      const startX = 15 + Math.random() * 70; // 15-85% across screen
      
      // Layer: 1-3 for parallax/swaying
      const layer = Math.floor(Math.random() * 3) + 1;
      
      // Size variation: 22-32px
      const size = 22 + Math.random() * 10;
      
      leaves.push({
        delay: currentDelay + (j * 0.5), // Stagger leaves in same spawn slightly
        duration,
        startX,
        layer,
        size,
      });
      
      if (j === leavesPerSpawn - 1) {
        i++; // Move to next spawn group
      }
    }
    
    // Spawn interval: 2-4s (less frequent)
    const spawnInterval = 2 + Math.random() * 2;
    currentDelay += spawnInterval;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[5]">
      {leaves.map((leaf, index) => (
        <FloatingLeaf
          key={index}
          delay={leaf.delay}
          duration={leaf.duration}
          startX={leaf.startX}
          layer={leaf.layer}
          size={leaf.size}
        />
      ))}
    </div>
  );
}

