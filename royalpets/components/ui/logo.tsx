import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

const sizes = {
  sm: { container: "h-8", icon: 24, text: "text-lg" },
  md: { container: "h-10", icon: 32, text: "text-xl" },
  lg: { container: "h-12", icon: 40, text: "text-2xl" },
  xl: { container: "h-16", icon: 56, text: "text-3xl" },
};

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const { container, icon, text } = sizes[size];

  return (
    <div className={cn("flex items-center gap-2", container, className)}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        aria-label="Royal Pets Logo"
      >
        {/* Crown */}
        <path
          d="M8 16L12 28H36L40 16L32 20L24 12L16 20L8 16Z"
          fill="url(#crownGradient)"
          stroke="#B8960C"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="8" cy="14" r="3" fill="#D4AF37" stroke="#B8960C" strokeWidth="1" />
        <circle cx="24" cy="10" r="3" fill="#D4AF37" stroke="#B8960C" strokeWidth="1" />
        <circle cx="40" cy="14" r="3" fill="#D4AF37" stroke="#B8960C" strokeWidth="1" />
        
        {/* Paw Print */}
        <ellipse cx="24" cy="38" rx="8" ry="6" fill="url(#pawGradient)" />
        <circle cx="16" cy="34" r="3" fill="url(#pawGradient)" />
        <circle cx="32" cy="34" r="3" fill="url(#pawGradient)" />
        <circle cx="20" cy="30" r="2.5" fill="url(#pawGradient)" />
        <circle cx="28" cy="30" r="2.5" fill="url(#pawGradient)" />
        
        {/* Gradients */}
        <defs>
          <linearGradient id="crownGradient" x1="8" y1="12" x2="40" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D4AF37" />
            <stop offset="0.5" stopColor="#E5C158" />
            <stop offset="1" stopColor="#D4AF37" />
          </linearGradient>
          <linearGradient id="pawGradient" x1="16" y1="30" x2="32" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4A148C" />
            <stop offset="1" stopColor="#6A1B9A" />
          </linearGradient>
        </defs>
      </svg>
      
      {showText && (
        <span className={cn("font-serif font-bold tracking-tight text-gradient-gold", text)}>
          Royal Pets
        </span>
      )}
    </div>
  );
}
