"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sparkles,
  Send,
  Bot,
  User,
  Dumbbell,
  TrendingUp,
  Calendar,
  Target,
  Lightbulb,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase/client"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const suggestedPrompts = [
  { icon: Dumbbell, text: "Create a workout for today" },
  { icon: TrendingUp, text: "How is my progress this week?" },
  { icon: Calendar, text: "What should I focus on tomorrow?" },
  { icon: Target, text: "Help me set a new fitness goal" },
]

type UserProfile = {
  name: string
  email: string
  phone: string
  location: string
  fitness: {
    goal: string
    experienceLevel: string
    workoutsPerWeek: string
    weight: string
    targetWeight: string
    height: string
  }
}

function buildLocalResponse(message: string, profile: UserProfile | null): string {
  const text = message.toLowerCase()
  const goal = profile?.fitness.goal
  const experience = profile?.fitness.experienceLevel
  const workouts = profile?.fitness.workoutsPerWeek
  const weight = profile?.fitness.weight
  const targetWeight = profile?.fitness.targetWeight
  const name = profile?.name || "there"

  const missing = {
    goal: !goal,
    experience: !experience,
    workouts: !workouts,
  }

  if (/^(hi|hello|hey|yo|sup|good (morning|afternoon|evening))\b/.test(text.trim())) {
    return `Hey ${name}! How can I help today—workout plan, goal setting, or nutrition?`
  }

  if (text.includes("workout") || text.includes("plan")) {
    if (missing.goal || missing.experience || missing.workouts) {
      return `I can build a personalized workout plan, but I need a few details from you first:
- Primary goal
- Experience level
- Workouts per week

Please update these in Settings and ask again.`
    }

    return `Here’s a simple ${goal} plan for ${workouts} days/week at a ${experience} level:

Day 1: Full body strength (compound lifts + accessories)
Day 2: Cardio + mobility
Day 3: Upper body strength
Day 4: Lower body strength
Day 5: Optional conditioning or active recovery

If you want, tell me which equipment you have and how much time you can train per session.`
  }

  if (text.includes("goal") || text.includes("set a goal")) {
    if (!goal) {
      return `What’s your primary goal? (build muscle, lose weight, increase strength, improve endurance, flexibility)`
    }
    return `Your current goal is **${goal}**. If you want to change it, tell me what goal you want and I’ll guide you.`
  }

  if (text.includes("progress") || text.includes("week")) {
    const details = [
      goal ? `Goal: ${goal}` : null,
      experience ? `Experience: ${experience}` : null,
      workouts ? `Workouts/week: ${workouts}` : null,
      weight ? `Current weight: ${weight}` : null,
      targetWeight ? `Target weight: ${targetWeight}` : null,
    ]
      .filter(Boolean)
      .join("\n- ")

    if (!details) {
      return `I don’t have enough progress data yet. If you log workouts or share your recent training, I can summarize it.`
    }

    return `Here’s what I have from your profile:
- ${details}

If you want detailed progress tracking, log workouts and update your measurements regularly.`
  }

  if (text.includes("tomorrow") || text.includes("focus")) {
    if (missing.goal || missing.experience || missing.workouts) {
      return `I can suggest tomorrow’s focus once I know your goal, experience level, and workouts per week.`
    }

    return `For tomorrow, focus on the next session in your ${goal} plan. A simple split for ${workouts} days/week:
1) Full body strength
2) Upper body strength
3) Lower body strength

Tell me which day you last trained and I’ll pick the exact session.`
  }

  if (text.includes("nutrition") || text.includes("diet") || text.includes("calories")) {
    if (!goal) {
      return `To give nutrition guidance, I need your primary goal first. Update it in Settings and ask again.`
    }
    return `For ${goal}, I can help you estimate calories and macros. Tell me your age, height, weight, and activity level.`
  }

  return `I can help with workout planning, goals, progress summaries, and nutrition basics. Ask a specific question and I’ll answer based on your profile.`
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hello! I'm your AI fitness coach. I've analyzed your workout history and I'm ready to help you optimize your training. 

What would you like to work on today? I can help with:
- Creating personalized workouts
- Analyzing your progress
- Setting and tracking goals
- Providing training tips

Just ask me anything!`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [chatError, setChatError] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return

      const profileDoc = await getDoc(doc(db, "users", user.uid))
      if (profileDoc.exists()) {
        const data = profileDoc.data()
        setProfile({
          name: `${data.firstName || ""} ${data.lastName || ""}`.trim() || user.displayName || "User",
          email: data.email || user.email || "",
          phone: data.phone || "",
          location: data.location || "",
          fitness: {
            goal: data.fitness?.goal || "",
            experienceLevel: data.fitness?.experienceLevel || "",
            workoutsPerWeek: data.fitness?.workoutsPerWeek || "",
            weight: data.fitness?.weight || "",
            targetWeight: data.fitness?.targetWeight || "",
            height: data.fitness?.height || "",
          },
        })
      } else {
        setProfile({
          name: user.displayName || "User",
          email: user.email || "",
          phone: "",
          location: "",
          fitness: {
            goal: "",
            experienceLevel: "",
            workoutsPerWeek: "",
            weight: "",
            targetWeight: "",
            height: "",
          },
        })
      }
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (messageText?: string) => {
    const text = messageText || input
    if (!text.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)
    setChatError(null)

    try {
      const reply = buildLocalResponse(text, profile)
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      }
      await new Promise((resolve) => setTimeout(resolve, 400))
      setMessages((prev) => [...prev, aiResponse])
    } catch (err) {
      setChatError("AI coach is unavailable. Please try again in a moment.")
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="h-[calc(100vh-6rem)] lg:h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center animate-pulse-glow">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Coach</h1>
            <p className="text-sm text-muted-foreground">Your personal fitness assistant</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setMessages(messages.slice(0, 1))}>
          <RefreshCw className="w-4 h-4 mr-2" />
          New Conversation
        </Button>
      </div>

      {chatError && <p className="text-sm text-destructive">{chatError}</p>}

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Main Chat Area */}
        <Card className="flex-1 glass border-border flex flex-col min-h-0">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4 lg:p-6" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] lg:max-w-[70%] rounded-2xl px-4 py-3",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "glass rounded-tl-none"
                    )}
                  >
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content.split("**").map((part, i) => 
                        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                      )}
                    </div>
                    <div
                      className={cn(
                        "text-[10px] mt-2",
                        message.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"
                      )}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="glass rounded-2xl rounded-tl-none px-4 py-3">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-3">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask your AI coach anything..."
                className="flex-1 bg-secondary border-border"
                disabled={isTyping}
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Sidebar - Suggested Prompts */}
        <div className="hidden lg:block w-72 space-y-4">
          <Card className="glass border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestedPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto py-3 px-3 hover:bg-primary/10"
                  onClick={() => handleSend(prompt.text)}
                  disabled={isTyping}
                >
                  <prompt.icon className="w-4 h-4 mr-3 text-primary flex-shrink-0" />
                  <span className="text-sm">{prompt.text}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="glass border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Your Profile Snapshot
              </CardTitle>
              <CardDescription className="text-xs">
                Based on your saved settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-secondary/50">
                <div className="text-xs text-muted-foreground mb-1">Goal</div>
                <div className="text-sm font-medium">
                  {profile?.fitness.goal || "Add a goal in Settings"}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <div className="text-xs text-muted-foreground mb-1">Experience</div>
                <div className="text-sm font-medium">
                  {profile?.fitness.experienceLevel || "Add experience level"}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <div className="text-xs text-muted-foreground mb-1">Workouts per week</div>
                <div className="text-sm font-medium">
                  {profile?.fitness.workoutsPerWeek || "Set frequency"}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <div className="text-xs text-muted-foreground mb-1">Current weight</div>
                <div className="text-sm font-medium">
                  {profile?.fitness.weight || "Add weight"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
