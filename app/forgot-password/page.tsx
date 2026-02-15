"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dumbbell, ArrowLeft, Mail, CheckCircle, Loader2 } from "lucide-react"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/lib/firebase/client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!email) {
      setError("Please enter your email address")
      return
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)

    try {
      await sendPasswordResetEmail(auth, email)
      setIsSubmitted(true)
    } catch (err) {
      setError("Unable to send reset email. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setIsLoading(true)
    setError("")
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (err) {
      setError("Unable to resend email. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 lg:p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center animate-pulse">
                <Dumbbell className="w-6 h-6 text-primary" />
              </div>
              <span className="text-2xl font-bold">
                Opti<span className="text-primary">Train</span>
              </span>
            </Link>
          </div>

          <Card className="glass border-border">
            <CardHeader className="text-center pb-4">
              {!isSubmitted ? (
                <>
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Forgot your password?</CardTitle>
                  <CardDescription className="mt-2">
                    No worries! Enter your email address and we'll send you a link to reset your password.
                  </CardDescription>
                </>
              ) : (
                <>
                  <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4 animate-bounce">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <CardTitle className="text-2xl">Check your email</CardTitle>
                  <CardDescription className="mt-2">
                    We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>
                  </CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent>
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-secondary/50 border-border focus:border-primary"
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-secondary/30 text-sm">
                    <p className="text-muted-foreground">
                      The link will expire in <span className="font-medium text-foreground">15 minutes</span>. 
                      If you don't see the email, check your spam folder.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={handleResend}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Resending...
                      </>
                    ) : (
                      "Resend Email"
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setIsSubmitted(false)
                      setEmail("")
                    }}
                  >
                    Try a different email
                  </Button>
                </div>
              )}

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Help */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Need help?{" "}
              <button className="text-primary hover:underline">Contact Support</button>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-4 text-center text-sm text-muted-foreground">
        <p>2026 OptiTrain. All rights reserved.</p>
      </footer>
    </div>
  )
}
