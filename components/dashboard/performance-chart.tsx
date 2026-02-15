"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

type PerformancePoint = {
  month: string
  actual: number
  predicted: number
}

interface PerformanceChartProps {
  data?: PerformancePoint[]
  emptyMessage?: string
}

export function PerformanceChart({ data = [], emptyMessage = "No performance data yet." }: PerformanceChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[300px] w-full rounded-xl border border-dashed border-border bg-secondary/30 flex items-center justify-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.7 0.18 145)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="oklch(0.7 0.18 145)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.65 0.2 280)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="oklch(0.65 0.2 280)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 270)" vertical={false} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
            tickFormatter={(value) => `${value}lb`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(0.15 0.01 270)",
              border: "1px solid oklch(0.25 0.01 270)",
              borderRadius: "8px",
              color: "oklch(0.98 0 0)",
            }}
            labelStyle={{ color: "oklch(0.65 0 0)" }}
          />
          <Area
            type="monotone"
            dataKey="actual"
            stroke="oklch(0.7 0.18 145)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorActual)"
            name="Actual"
          />
          <Area
            type="monotone"
            dataKey="predicted"
            stroke="oklch(0.65 0.2 280)"
            strokeWidth={2}
            strokeDasharray="5 5"
            fillOpacity={1}
            fill="url(#colorPredicted)"
            name="AI Predicted"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
