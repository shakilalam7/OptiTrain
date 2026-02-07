"use client";

import { Dumbbell, Heart, Zap, Target, Trophy, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

const icons = [
  { Icon: Dumbbell, delay: "0s", x: "10%", y: "20%" },
  { Icon: Heart, delay: "0.5s", x: "85%", y: "15%" },
  { Icon: Zap, delay: "1s", x: "15%", y: "70%" },
  { Icon: Target, delay: "1.5s", x: "80%", y: "65%" },
  { Icon: Trophy, delay: "2s", x: "50%", y: "10%" },
  { Icon: Flame, delay: "2.5s", x: "90%", y: "40%" },
];

export function FloatingIcons({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {icons.map(({ Icon, delay, x, y }, index) => (
        <div
          key={index}
          className="absolute animate-float opacity-20"
          style={{
            left: x,
            top: y,
            animationDelay: delay,
            animationDuration: `${3 + index * 0.5}s`,
          }}
        >
          <Icon className="w-8 h-8 text-primary" />
        </div>
      ))}
    </div>
  );
}
