import { cn } from '@/lib/utils';
import logoImage from '@/assets/logo.png';

interface UnwindLogoProps {
  className?: string;
  size?: number;
}

export function UnwindLogo({ className, size = 40 }: UnwindLogoProps) {
  return (
    <img
      src={logoImage}
      alt="Unwind logo"
      width={size}
      height={size}
      className={cn("object-contain", className)}
    />
  );
}

