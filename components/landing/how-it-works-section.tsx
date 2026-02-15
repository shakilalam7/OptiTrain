"use client"

import { useEffect, useRef, useState } from "react"
import { UserPlus, ClipboardList, Sparkles, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  {
    icon: UserPlus,
    title: "Create Your Profile",
    description: "Sign up and tell us about your fitness goals, experience level, and preferences.",
  },
  {
    icon: ClipboardList,
    title: "Log Your Workouts",
    description: "Track your exercises, sets, reps, and weights. Our AI learns from your data.",
  },
  {
    icon: Sparkles,
    title: "Get AI Insights",
    description: "Receive personalized recommendations, forecasts, and coaching from our AI.",
  },
  {
    icon: Trophy,
    title: "Achieve Your Goals",
    description: "Follow your optimized plan and watch your performance improve over time.",
  },
]

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="how-it-works" className="py-24 relative" ref={sectionRef}>
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm text-primary font-medium tracking-wider uppercase mb-4 block">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Your Journey to <span className="gradient-text">Peak Performance</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Get started in minutes and let our AI guide you to your fitness goals.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6 md:gap-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={cn(
                  "relative group cursor-pointer",
                  "transition-all duration-500"
                )}
                onMouseEnter={() => setActiveStep(index)}
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-border">
                    <div
                      className={cn(
                        "h-full bg-primary transition-all duration-500",
                        activeStep > index ? "w-full" : "w-0"
                      )}
                    />
                  </div>
                )}

                <div
                  className={cn(
                    "relative z-10 p-6 rounded-2xl transition-all duration-500",
                    activeStep === index
                      ? "glass border-primary/30 scale-105"
                      : "hover:bg-secondary/50"
                  )}
                >
                  <div
                    className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto transition-all duration-500",
                      activeStep === index
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    <step.icon className="w-7 h-7" />
                  </div>

                  <div className="text-center">
                    <div className="text-xs text-primary font-medium mb-2">
                      Step {index + 1}
                    </div>
                    <h3 className="font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center gap-2 mt-8 md:hidden">
            {steps.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveStep(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  activeStep === index ? "w-8 bg-primary" : "bg-border"
                )}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
