"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react"
import { PerformanceChart } from "@/components/dashboard/performance-chart"
import { cn } from "@/lib/utils"
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts"

const strengthData: { exercise: string; current: number; previous: number; change: number }[] = []
const bodyCompositionData: { week: string; weight: number; bodyFat: number }[] = []
const fitnessRadarData: { metric: string; value: number }[] = []
const workoutConsistency: { month: string; workouts: number; target: number }[] = []

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("6m")

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your progress and performance insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs value={timeRange} onValueChange={setTimeRange}>
            <TabsList className="bg-secondary">
              <TabsTrigger value="1m">1M</TabsTrigger>
              <TabsTrigger value="3m">3M</TabsTrigger>
              <TabsTrigger value="6m">6M</TabsTrigger>
              <TabsTrigger value="1y">1Y</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Custom Range
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      <Card className="glass border-border">
        <CardHeader>
          <CardTitle>Performance Trend with AI Predictions</CardTitle>
          <CardDescription>
            Your actual performance vs AI-predicted trajectory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PerformanceChart data={[]} emptyMessage="Add workouts to see performance trends and AI predictions." />
        </CardContent>
      </Card>

      {/* Strength Progress */}
      <Card className="glass border-border">
        <CardHeader>
          <CardTitle>Strength Progress</CardTitle>
          <CardDescription>Compare your current lifts to previous records</CardDescription>
        </CardHeader>
        <CardContent>
          {strengthData.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
              No strength data yet. Log workouts with weights to track progress.
            </div>
          ) : (
            <div className="space-y-4">
              {strengthData.map((exercise, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/50"
                >
                  <div className="flex-1">
                    <div className="font-medium mb-1">{exercise.exercise}</div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Previous: {exercise.previous} kg
                      </span>
                      <span className="text-foreground font-medium">
                        Current: {exercise.current} kg
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium",
                        exercise.change > 0
                          ? "bg-primary/20 text-primary"
                          : exercise.change < 0
                            ? "bg-destructive/20 text-destructive"
                            : "bg-muted text-muted-foreground"
                      )}
                    >
                      {exercise.change > 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : exercise.change < 0 ? (
                        <TrendingDown className="w-4 h-4" />
                      ) : (
                        <Minus className="w-4 h-4" />
                      )}
                      {exercise.change > 0 ? "+" : ""}
                      {exercise.change}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Body Composition */}
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle>Body Composition</CardTitle>
            <CardDescription>Weight and body fat percentage trends</CardDescription>
          </CardHeader>
          <CardContent>
            {bodyCompositionData.length === 0 ? (
              <div className="h-[300px] w-full rounded-xl border border-dashed border-border bg-secondary/30 flex items-center justify-center text-sm text-muted-foreground">
                No body composition data yet.
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bodyCompositionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 270)" vertical={false} />
                    <XAxis
                      dataKey="week"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
                    />
                    <YAxis
                      yAxisId="weight"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
                      domain={["dataMin - 5", "dataMax + 5"]}
                    />
                    <YAxis
                      yAxisId="bodyFat"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
                      domain={[0, 25]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.15 0.01 270)",
                        border: "1px solid oklch(0.25 0.01 270)",
                        borderRadius: "8px",
                        color: "oklch(0.98 0 0)",
                      }}
                    />
                    <Line
                      yAxisId="weight"
                      type="monotone"
                      dataKey="weight"
                      stroke="oklch(0.7 0.18 145)"
                      strokeWidth={2}
                      dot={{ fill: "oklch(0.7 0.18 145)", r: 4 }}
                      name="Weight (kg)"
                    />
                    <Line
                      yAxisId="bodyFat"
                      type="monotone"
                      dataKey="bodyFat"
                      stroke="oklch(0.75 0.15 60)"
                      strokeWidth={2}
                      dot={{ fill: "oklch(0.75 0.15 60)", r: 4 }}
                      name="Body Fat (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fitness Radar */}
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle>Fitness Profile</CardTitle>
            <CardDescription>Your overall fitness assessment</CardDescription>
          </CardHeader>
          <CardContent>
            {fitnessRadarData.length === 0 ? (
              <div className="h-[300px] w-full rounded-xl border border-dashed border-border bg-secondary/30 flex items-center justify-center text-sm text-muted-foreground">
                No fitness profile data yet.
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={fitnessRadarData}>
                    <PolarGrid stroke="oklch(0.25 0.01 270)" />
                    <PolarAngleAxis
                      dataKey="metric"
                      tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
                    />
                    <Radar
                      name="Fitness Score"
                      dataKey="value"
                      stroke="oklch(0.7 0.18 145)"
                      fill="oklch(0.7 0.18 145)"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Workout Consistency */}
      <Card className="glass border-border">
        <CardHeader>
          <CardTitle>Workout Consistency</CardTitle>
          <CardDescription>Monthly workout completion vs target</CardDescription>
        </CardHeader>
        <CardContent>
          {workoutConsistency.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
              No consistency data yet. Set a monthly target after logging workouts.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {workoutConsistency.map((month, index) => {
                const percentage = (month.workouts / month.target) * 100
                return (
                  <div key={index} className="text-center p-4 rounded-xl bg-secondary/50">
                    <div className="text-sm text-muted-foreground mb-2">{month.month}</div>
                    <div
                      className={cn(
                        "text-2xl font-bold mb-1",
                        percentage >= 100 ? "text-primary" : percentage >= 80 ? "text-chart-4" : "text-muted-foreground"
                      )}
                    >
                      {month.workouts}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      of {month.target} workouts
                    </div>
                    <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          percentage >= 100 ? "bg-primary" : percentage >= 80 ? "bg-chart-4" : "bg-muted-foreground"
                        )}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
