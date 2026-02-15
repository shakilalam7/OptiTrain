"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Dumbbell,
  TrendingUp,
  Calendar,
  ChevronRight,
} from "lucide-react"
import { PerformanceChart } from "@/components/dashboard/performance-chart"
import { WeeklyActivityChart } from "@/components/dashboard/weekly-activity-chart"
import { ProgressRing } from "@/components/ui/progress-ring"
import { GlowingCard } from "@/components/ui/glowing-card"
import { PulseRing } from "@/components/ui/pulse-ring"
import { cn } from "@/lib/utils"

const quickStats = []
const upcomingWorkouts = []
const recentAchievements = []

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Welcome to OptiTrain</h1>
          <p className="text-muted-foreground mt-1">
            {"Your dashboard will populate as you log workouts and set goals."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard/analytics">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Analytics
            </Link>
          </Button>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/dashboard/workouts">
              <Dumbbell className="w-4 h-4 mr-2" />
              Log Workout
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.length === 0 ? (
          <Card className="glass border-dashed border-border col-span-2 lg:col-span-4">
            <CardContent className="p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="text-lg">No stats yet</CardTitle>
                <CardDescription>Log a workout to start tracking progress.</CardDescription>
              </div>
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/dashboard/workouts">
                  <Dumbbell className="w-4 h-4 mr-2" />
                  Log Your First Workout
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          quickStats.map((stat, index) => (
            <Card
              key={index}
              className={cn(
                "glass border-border transition-all duration-500",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl lg:text-3xl font-bold">{stat.value}</span>
                      {stat.suffix && (
                        <span className="text-sm text-muted-foreground">{stat.suffix}</span>
                      )}
                      {stat.target && (
                        <span className="text-sm text-muted-foreground">/{stat.target}</span>
                      )}
                    </div>
                  </div>
                  <div className={cn("p-2 lg:p-3 rounded-xl", stat.bgColor)}>
                    <stat.icon className={cn("w-5 h-5 lg:w-6 lg:h-6", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="text-lg">Performance Trend</CardTitle>
            <CardDescription>Your strength progression over time</CardDescription>
          </CardHeader>
          <CardContent>
            <PerformanceChart data={[]} emptyMessage="Log workouts to see performance trends." />
          </CardContent>
        </Card>

        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Activity</CardTitle>
            <CardDescription>Workout duration this week</CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyActivityChart data={[]} emptyMessage="No activity logged yet." />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Workouts */}
        <Card className="glass border-border lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Upcoming Workouts</CardTitle>
              <CardDescription>Your scheduled training sessions</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/planner">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingWorkouts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
                No workouts scheduled yet. Add sessions in Planner to see them here.
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingWorkouts.map((workout, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{workout.type}</div>
                        <div className="text-sm text-muted-foreground">
                          {workout.day} at {workout.time}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Start
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Goal */}
        <GlowingCard className="h-full">
          <Card className="glass border-border h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Weekly Goal
                <PulseRing size="sm" color="success" />
              </CardTitle>
              <CardDescription>Set a weekly target to stay on track.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <ProgressRing progress={0} size={140} strokeWidth={10} color="primary" animated={false}>
                  <div className="text-center">
                    <span className="text-3xl font-bold">0%</span>
                    <p className="text-xs text-muted-foreground">No goal yet</p>
                  </div>
                </ProgressRing>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Recent Achievements</h4>
                {recentAchievements.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border bg-secondary/30 p-3 text-xs text-muted-foreground">
                    Achievements will appear as you complete workouts and hit milestones.
                  </div>
                ) : (
                  recentAchievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center animate-pulse">
                        <achievement.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{achievement.title}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {achievement.description}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </GlowingCard>
      </div>
    </div>
  )
}
