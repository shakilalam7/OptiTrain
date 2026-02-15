import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { StatsSection } from "@/components/landing/stats-section"
import { CTASection } from "@/components/landing/cta-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { ContactSection } from "@/components/landing/contact-section"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { ParticleBackground } from "@/components/ui/particle-background"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background relative">
      <ParticleBackground />
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <HowItWorksSection />
      <PricingSection />
      <CTASection />
      <ContactSection />
      <Footer />
    </main>
  )
}
