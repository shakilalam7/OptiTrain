"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const tiers = [
  {
    name: "Starter",
    price: "$0",
    cadence: "forever",
    description: "For getting started with AI-guided training.",
    features: [
      "Personalized workout suggestions",
      "Basic progress tracking",
      "AI coach chat (limited)",
      "Community challenges",
    ],
    cta: "Start Free",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    cadence: "per month",
    description: "For athletes who want advanced insights and plans.",
    features: [
      "Adaptive training plans",
      "Performance forecasting",
      "Unlimited AI coach chat",
      "Advanced analytics dashboard",
      "Priority support",
    ],
    cta: "Go Pro",
    href: "/signup",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$49",
    cadence: "per month",
    description: "For gyms and teams managing multiple athletes.",
    features: [
      "Multi-athlete dashboards",
      "Coach collaboration tools",
      "Custom training templates",
      "Team performance reports",
      "Dedicated success manager",
    ],
    cta: "Talk to Sales",
    href: "#contact",
    highlighted: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm text-primary font-medium tracking-wider uppercase mb-4 block">
            Pricing
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Choose the Plan That Fits Your <span className="gradient-text">Goals</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Transparent pricing with everything you need to train smarter. Upgrade anytime.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "relative rounded-3xl border border-border/60 bg-background/80 p-8 glass transition-all",
                tier.highlighted && "border-primary/60 shadow-[0_0_30px_rgba(74,222,128,0.15)]"
              )}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Most Popular
                </div>
              )}

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">{tier.name}</h3>
                <div className="text-right">
                  <div className="text-3xl font-bold">{tier.price}</div>
                  <div className="text-xs text-muted-foreground">{tier.cadence}</div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={cn(
                  "w-full",
                  tier.highlighted
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                )}
              >
                <Link href={tier.href}>{tier.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-8">
          All plans include a 14-day free trial. Cancel anytime.
        </p>
      </div>
    </section>
  )
}
