"use client";

import { cn } from "@/lib/utils";

interface PulseRingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "accent" | "success";
}

export function PulseRing({
  className,
  size = "md",
  color = "primary",
}: PulseRingProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-6 h-6",
  };

  const colorClasses = {
    primary: "bg-primary",
    accent: "bg-accent",
    success: "bg-success",
  };

  const ringColorClasses = {
    primary: "border-primary",
    accent: "border-accent",
    success: "border-success",
  };

  return (
    <span className={cn("relative flex", sizeClasses[size], className)}>
      <span
        className={cn(
          "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
          colorClasses[color]
        )}
      />
      <span
        className={cn(
          "relative inline-flex rounded-full h-full w-full",
          colorClasses[color]
        )}
      />
    </span>
  );
}

export function PulseRingOutline({
  className,
  size = "md",
  color = "primary",
}: PulseRingProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const colorClasses = {
    primary: "border-primary/50",
    accent: "border-accent/50",
    success: "border-success/50",
  };

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <div
        className={cn(
          "absolute inset-0 rounded-full border-2 animate-ping",
          colorClasses[color]
        )}
        style={{ animationDuration: "2s" }}
      />
      <div
        className={cn(
          "absolute inset-0 rounded-full border-2 animate-ping",
          colorClasses[color]
        )}
        style={{ animationDuration: "2s", animationDelay: "0.5s" }}
      />
      <div
        className={cn(
          "absolute inset-0 rounded-full border-2",
          colorClasses[color]
        )}
      />
    </div>
  );
}
