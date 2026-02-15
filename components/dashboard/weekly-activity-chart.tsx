"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

type WeeklyActivityPoint = {
  day: string
  minutes: number
  completed: boolean
}

interface WeeklyActivityChartProps {
  data?: WeeklyActivityPoint[]
  emptyMessage?: string
}

export function WeeklyActivityChart({ data = [], emptyMessage = "No activity logged this week." }: WeeklyActivityChartProps) {
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
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 270)" vertical={false} />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
            tickFormatter={(value) => `${value}m`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(0.15 0.01 270)",
              border: "1px solid oklch(0.25 0.01 270)",
              borderRadius: "8px",
              color: "oklch(0.98 0 0)",
            }}
            labelStyle={{ color: "oklch(0.65 0 0)" }}
            formatter={(value: number) => [`${value} min`, "Duration"]}
          />
          <Bar dataKey="minutes" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.completed ? "oklch(0.7 0.18 145)" : "oklch(0.25 0.01 270)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
