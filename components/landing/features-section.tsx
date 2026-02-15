"use client"

import { useEffect, useRef, useState } from "react"
import { Brain, TrendingUp, MessageSquare, Calendar, BarChart3, Target } from "lucide-react"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: Brain,
    title: "AI Recommendations",
    description: "Get personalized workout suggestions based on your goals, history, and performance patterns.",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    icon: TrendingUp,
    title: "Performance Forecasting",
    description: "Predict your strength progression and endurance improvements with ML-powered analytics.",
    gradient: "from-chart-2/20 to-chart-2/5",
  },
  {
    icon: MessageSquare,
    title: "AI Coach Chatbot",
    description: "Real-time guidance and motivational feedback through natural language conversations.",
    gradient: "from-chart-3/20 to-chart-3/5",
  },
  {
    icon: Calendar,
    title: "Smart Workout Plans",
    description: "Automatically generated training schedules that adapt to your progress and availability.",
    gradient: "from-chart-4/20 to-chart-4/5",
  },
  {
    icon: BarChart3,
    title: "Visual Analytics",
    description: "Track your journey with interactive charts, progress graphs, and performance insights.",
    gradient: "from-chart-5/20 to-chart-5/5",
  },
  {
    icon: Target,
    title: "Goal Tracking",
    description: "Set, monitor, and achieve your fitness goals with intelligent milestone tracking.",
    gradient: "from-accent/20 to-accent/5",
  },
]

export function FeaturesSection() {
  const [visibleCards, setVisibleCards] = useState<number[]>([])
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"))
            setVisibleCards((prev) => [...new Set([...prev, index])])
          }
        })
      },
      { threshold: 0.2 }
    )

    const cards = sectionRef.current?.querySelectorAll("[data-index]")
    cards?.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [])

  return (
    <section id="features" className="py-24 relative" ref={sectionRef}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm text-primary font-medium tracking-wider uppercase mb-4 block">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Everything You Need to{" "}
            <span className="gradient-text">Optimize</span> Your Training
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Powered by machine learning and data analytics, OptiTrain delivers an intelligent fitness experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              data-index={index}
              className={cn(
                "group relative p-6 rounded-2xl glass hover:border-primary/30 transition-all duration-500 cursor-default",
                visibleCards.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className={cn("absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity", feature.gradient)} />

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>

                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
