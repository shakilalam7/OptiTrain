"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dumbbell, Eye, EyeOff, ArrowRight, Mail, Lock, User, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { auth } from "@/lib/firebase/client"
import { doc, serverTimestamp, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/client"

const fitnessGoals = [
  { id: "strength", label: "Build Strength", icon: "💪" },
  { id: "weight-loss", label: "Lose Weight", icon: "🔥" },
  { id: "endurance", label: "Build Endurance", icon: "🏃" },
  { id: "flexibility", label: "Improve Flexibility", icon: "🧘" },
]

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "",
    goal: "",
    experienceLevel: "beginner",
    workoutsPerWeek: "3",
    agreeToTerms: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (step === 1) {
      setStep(2)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      )
      if (formData.name.trim()) {
        await updateProfile(userCredential.user, { displayName: formData.name.trim() })
      }
      const [firstName, ...rest] = formData.name.trim().split(" ")
      const lastName = rest.join(" ")
      await setDoc(doc(db, "users", userCredential.user.uid), {
        firstName: firstName || "",
        lastName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        fitness: {
          goal: formData.goal,
          experienceLevel: formData.experienceLevel,
          workoutsPerWeek: formData.workoutsPerWeek,
          weight: "",
          height: "",
          targetWeight: "",
        },
        notifications: {
          workoutReminders: true,
          progressUpdates: true,
          aiInsights: true,
          weeklyReports: true,
          emailNotifications: false,
          pushNotifications: true,
        },
        appearance: {
          theme: "system",
          compactMode: false,
          animationsEnabled: true,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      router.push("/dashboard")
    } catch (err) {
      setError("Unable to create account. Please check your details and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      const [firstName, ...rest] = (user.displayName || "").trim().split(" ")
      const lastName = rest.join(" ")
      await setDoc(
        doc(db, "users", user.uid),
        {
          firstName,
          lastName,
          email: user.email || "",
          phone: "",
          location: "",
          fitness: {
            goal: "",
            experienceLevel: "",
            workoutsPerWeek: "",
            weight: "",
            height: "",
            targetWeight: "",
          },
          notifications: {
            workoutReminders: true,
            progressUpdates: true,
            aiInsights: true,
            weeklyReports: true,
            emailNotifications: false,
            pushNotifications: true,
          },
          appearance: {
            theme: "dark",
            compactMode: false,
            animationsEnabled: true,
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
      router.push("/dashboard")
    } catch (err) {
      setError("Google sign-in failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-accent/30 rounded-full blur-[128px]" />
        
        <div className="relative z-10 flex items-center justify-center w-full p-12">
          <div className="max-w-md">
            <h2 className="text-4xl font-bold mb-6">
              Start Your <span className="gradient-text">Transformation</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Join thousands of users who have achieved their fitness goals with AI-powered coaching.
            </p>
            
            <div className="space-y-4">
              {[
                "Personalized workout recommendations",
                "AI-powered performance forecasting",
                "Real-time coaching and guidance",
                "Progress tracking and analytics",
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 group">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <Dumbbell className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold">
              Opti<span className="text-primary">Train</span>
            </span>
          </Link>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mb-8">
            <div className="flex-1 h-1 rounded-full bg-primary" />
            <div className={cn("flex-1 h-1 rounded-full transition-colors", step === 2 ? "bg-primary" : "bg-secondary")} />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {step === 1 ? "Create your account" : "Set your goal"}
            </h1>
            <p className="text-muted-foreground">
              {step === 1 
                ? "Start your fitness journey today" 
                : "Choose what you want to achieve"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      className="pl-10 bg-secondary border-border focus:border-primary"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10 bg-secondary border-border focus:border-primary"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      className="pl-10 pr-10 bg-secondary border-border focus:border-primary"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    className="bg-secondary border-border focus:border-primary"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="City, Country"
                    className="bg-secondary border-border focus:border-primary"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Select your primary goal
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {fitnessGoals.map((goal) => (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, goal: goal.id })}
                        className={cn(
                          "p-4 rounded-xl border text-left transition-all",
                          formData.goal === goal.id
                            ? "border-primary bg-primary/10"
                            : "border-border bg-secondary hover:border-primary/50"
                        )}
                      >
                        <span className="text-2xl block mb-2">{goal.icon}</span>
                        <span className="text-sm font-medium">{goal.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Select your experience level</Label>
                  <Select
                    value={formData.experienceLevel}
                    onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label>Workouts per week</Label>
                  <Select
                    value={formData.workoutsPerWeek}
                    onValueChange={(value) => setFormData({ ...formData, workoutsPerWeek: value })}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 days</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="4">4 days</SelectItem>
                      <SelectItem value="5">5 days</SelectItem>
                      <SelectItem value="6">6 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, agreeToTerms: checked as boolean })
                    }
                    required
                  />
                  <Label htmlFor="terms" className="text-sm font-normal cursor-pointer leading-relaxed">
                    I agree to the{" "}
                    <Link href="#" className="text-primary hover:underline">Terms of Service</Link>
                    {" "}and{" "}
                    <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
                  </Label>
                </div>
              </>
            )}

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              {step === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 py-6 border-border hover:bg-secondary bg-transparent"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
              )}
              <Button
                type="submit"
                className={cn(
                  "bg-primary text-primary-foreground hover:bg-primary/90 py-6",
                  step === 1 ? "w-full" : "flex-1"
                )}
                disabled={isLoading || (step === 2 && (!formData.goal || !formData.agreeToTerms))}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    {step === 1 ? "Continue" : "Create Account"}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {step === 1 && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-background text-muted-foreground">or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Button
                  variant="outline"
                  className="py-5 border-border hover:bg-secondary bg-transparent"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
              </div>
            </>
          )}

          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
