"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Sparkles, TrendingUp, MessageSquare, Calendar } from "lucide-react"

const floatingCards = [
  { icon: TrendingUp, label: "Performance +23%", delay: "0s", position: "top-20 left-10" },
  { icon: MessageSquare, label: "AI Coach Ready", delay: "0.5s", position: "top-40 right-10" },
  { icon: Calendar, label: "Plan Generated", delay: "1s", position: "bottom-32 left-20" },
]

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[64px]" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">AI-Powered Fitness Revolution</span>
          </div>

          {/* Headline */}
          <h1
            className={`text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            Train Smarter with{" "}
            <span className="gradient-text">AI-Driven</span>{" "}
            Fitness
          </h1>

          {/* Subheadline */}
          <p
            className={`text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            Personalized workout recommendations, performance forecasting, and real-time AI coaching. 
            Your intelligent fitness companion that adapts to your goals.
          </p>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base animate-pulse-glow"
            >
              <Link href="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-6 text-base border-border hover:bg-secondary group bg-transparent"
            >
              <Play className="mr-2 w-4 h-4 group-hover:text-primary transition-colors" />
              Watch Demo
            </Button>
          </div>

          {/* Floating Cards */}
          <div className="relative h-64 md:h-80">
            {floatingCards.map((card, index) => (
              <div
                key={index}
                className={`absolute ${card.position} glass rounded-xl px-4 py-3 animate-float hidden md:flex items-center gap-3 transition-all duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}
                style={{ animationDelay: card.delay }}
              >
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <card.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium">{card.label}</span>
              </div>
            ))}

            {/* Central Dashboard Preview */}
            <div
              className={`glass rounded-2xl p-4 max-w-md mx-auto transition-all duration-1000 delay-500 ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Weekly Progress</span>
                  <span className="text-sm font-medium text-primary">+15%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-primary rounded-full transition-all duration-1000" style={{ width: mounted ? "75%" : "0%" }} />
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {["Mon", "Wed", "Fri"].map((day) => (
                    <div key={day} className="text-center p-2 rounded-lg bg-secondary/50">
                      <span className="text-xs text-muted-foreground block">{day}</span>
                      <span className="text-sm font-medium">45min</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
