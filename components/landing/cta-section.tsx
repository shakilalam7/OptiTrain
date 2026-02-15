"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[128px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Start your transformation today</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-balance">
            Ready to <span className="gradient-text">Optimize</span> Your Training?
          </h2>

          <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-xl mx-auto">
            Join thousands of users who have transformed their fitness journey with AI-powered coaching and personalized insights.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base animate-pulse-glow"
            >
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="px-8 py-6 text-base border-border hover:bg-secondary bg-transparent"
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            No credit card required. Free 14-day trial.
          </p>
        </div>
      </div>
    </section>
  )
}
