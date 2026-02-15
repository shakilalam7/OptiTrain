"use client"

import Link from "next/link"
import { Mail, MessageSquareText } from "lucide-react"

export function ContactSection() {
  return (
    <section id="contact" className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/20 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto rounded-3xl border border-border/60 bg-background/80 p-10 glass">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <span className="text-sm text-primary font-medium tracking-wider uppercase mb-3 block">
                Contact
              </span>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Need help or want a demo?
              </h2>
              <p className="text-muted-foreground">
                Reach our team for onboarding, questions, or partnership opportunities.
              </p>
            </div>

            <div className="space-y-4">
              <Link
                href="mailto:shakilalam.business@gmail.com"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="w-4 h-4 text-primary" />
                shakilalam.business@gmail.com
              </Link>
              <Link
                href="mailto:shakilalam.business@gmail.com"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageSquareText className="w-4 h-4 text-primary" />
                shakilalam.business@gmail.com
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
