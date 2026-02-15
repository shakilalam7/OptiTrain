"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sparkles, Calendar, Dumbbell, Clock, ChevronLeft, ChevronRight, Check, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { onAuthStateChanged } from "firebase/auth"
import { collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase/client"

interface PlannedWorkout {
  id: string
  day: number
  name: string
  type: "strength" | "cardio"
  duration: number
  exercises: string[]
  completed: boolean
  sourceWorkoutId?: string
}

interface SavedWorkout {
  id: string
  name: string
  type: "strength" | "cardio"
  duration: number
  exercises: { name: string }[]
}

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const fullDaysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

const initialPlan: PlannedWorkout[] = []

const typeColors = {
  strength: "bg-primary/20 text-primary border-primary/30",
  cardio: "bg-chart-4/20 text-chart-4 border-chart-4/30",
}

export default function PlannerPage() {
  const [plan, setPlan] = useState<PlannedWorkout[]>(initialPlan)
  const [selectedDay, setSelectedDay] = useState<PlannedWorkout | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingWorkouts, setLoadingWorkouts] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([])
  const [newWorkout, setNewWorkout] = useState({
    day: "",
    workoutId: "",
  })

  const today = new Date()
  const startOfWeek = useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() - date.getDay() + currentWeekOffset * 7)
    return date
  }, [currentWeekOffset])

  const weekId = useMemo(() => startOfWeek.toISOString().split("T")[0], [startOfWeek])

  const getDateForDay = (dayIndex: number) => {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + dayIndex)
    return date
  }

  const isToday = (dayIndex: number) => {
    const date = getDateForDay(dayIndex)
    return date.toDateString() === today.toDateString()
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid || null)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const loadPlan = async () => {
      if (!userId) {
        setPlan([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const planDoc = await getDoc(doc(db, "users", userId, "planner", weekId))
        if (planDoc.exists()) {
          const data = planDoc.data()
          setPlan(Array.isArray(data.items) ? data.items : [])
        } else {
          setPlan([])
        }
      } catch (err) {
        console.error(err)
        setError("Unable to load planner. Please refresh and try again.")
      } finally {
        setLoading(false)
      }
    }

    loadPlan()
  }, [userId, weekId])

  useEffect(() => {
    const loadWorkouts = async () => {
      if (!userId) {
        setSavedWorkouts([])
        setLoadingWorkouts(false)
        return
      }

      setLoadingWorkouts(true)
      try {
        const workoutsRef = collection(db, "users", userId, "workouts")
        const snapshot = await getDocs(query(workoutsRef, orderBy("createdAt", "desc")))
        const logs = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as Partial<SavedWorkout>
          return {
            id: docSnap.id,
            name: data.name || "Workout",
            type: (data.type as "strength" | "cardio") || "strength",
            duration: data.duration || 0,
            exercises: Array.isArray(data.exercises) ? data.exercises : [],
          }
        })
        setSavedWorkouts(logs)
      } catch (err) {
        console.error(err)
        setError("Unable to load workouts for planner.")
      } finally {
        setLoadingWorkouts(false)
      }
    }

    loadWorkouts()
  }, [userId])

  const persistPlan = async (nextPlan: PlannedWorkout[]) => {
    if (!userId) {
      setError("You must be signed in to update your plan.")
      return
    }

    try {
      await setDoc(
        doc(db, "users", userId, "planner", weekId),
        {
          weekStart: weekId,
          items: nextPlan,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    } catch (err) {
      console.error(err)
      setError("Unable to save planner updates. Please try again.")
    }
  }

  const toggleComplete = async (id: string) => {
    const updated = plan.map((w) => (w.id === id ? { ...w, completed: !w.completed } : w))
    setPlan(updated)
    await persistPlan(updated)
  }

  const addWorkout = async () => {
    if (!newWorkout.workoutId || newWorkout.day === "") {
      setError("Pick a day and workout to add.")
      return
    }

    const picked = savedWorkouts.find((w) => w.id === newWorkout.workoutId)
    if (!picked) {
      setError("Selected workout not found.")
      return
    }

    const workout: PlannedWorkout = {
      id: `${weekId}-${picked.id}-${newWorkout.day}`,
      day: Number(newWorkout.day),
      name: picked.name,
      type: picked.type,
      duration: picked.duration,
      exercises: picked.exercises.map((ex) => ex.name),
      completed: false,
      sourceWorkoutId: picked.id,
    }

    const updated = [...plan.filter((w) => w.day !== workout.day), workout]
    setPlan(updated)
    await persistPlan(updated)

    setNewWorkout({ day: "", workoutId: "" })
    setIsAddOpen(false)
  }

  const removeWorkoutFromDay = async () => {
    if (!selectedDay) return
    const updated = plan.filter((w) => w.id !== selectedDay.id)
    setPlan(updated)
    setSelectedDay(null)
    await persistPlan(updated)
  }

  const generatePlan = async () => {
    if (!userId) {
      setError("You must be signed in to generate a plan.")
      return
    }

    if (savedWorkouts.length === 0) {
      setError("Add workouts in the Workouts page before generating a plan.")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const profileDoc = await getDoc(doc(db, "users", userId))
      const workoutsPerWeek = profileDoc.exists()
        ? Number(profileDoc.data().fitness?.workoutsPerWeek || 3)
        : 3
      const daysOrder = [1, 3, 5, 2, 4, 6, 0]
      const count = Math.max(1, Math.min(daysOrder.length, workoutsPerWeek))

      const generated: PlannedWorkout[] = Array.from({ length: count }).map((_, index) => {
        const template = savedWorkouts[index % savedWorkouts.length]
        return {
          id: `${weekId}-${template.id}-${index}`,
          day: daysOrder[index],
          name: template.name,
          type: template.type,
          duration: template.duration,
          exercises: template.exercises.map((ex) => ex.name),
          completed: false,
          sourceWorkoutId: template.id,
        }
      })

      setPlan(generated)
      await persistPlan(generated)
    } catch (err) {
      console.error(err)
      setError("Unable to generate plan. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Workout Planner</h1>
          <p className="text-muted-foreground mt-1">
            Plan your week using workouts you already saved
          </p>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </div>
        <div className="flex items-center gap-3">
          {mounted ? (
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Workout
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Workout</DialogTitle>
                  <DialogDescription>Select a saved workout and assign a day.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label>Day</Label>
                    <Select value={newWorkout.day} onValueChange={(value) => setNewWorkout({ ...newWorkout, day: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {daysOfWeek.map((day, index) => (
                          <SelectItem key={day} value={String(index)}>
                            {fullDaysOfWeek[index]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Workout</Label>
                    <Select
                      value={newWorkout.workoutId}
                      onValueChange={(value) => setNewWorkout({ ...newWorkout, workoutId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingWorkouts ? "Loading workouts..." : "Select workout"} />
                      </SelectTrigger>
                      <SelectContent>
                        {savedWorkouts.map((workout) => (
                          <SelectItem key={workout.id} value={workout.id}>
                            {workout.name} ({workout.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={addWorkout}>
                    Add Workout
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Button variant="outline" disabled>
              <Plus className="w-4 h-4 mr-2" />
              Add Workout
            </Button>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate AI Workout Plan</DialogTitle>
                <DialogDescription>
                  Plans are built from workouts you already saved.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="font-medium">AI Analysis</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your plan uses workouts from your library and respects your workouts per week setting.
                  </p>
                </div>
                <Button
                  onClick={generatePlan}
                  disabled={isGenerating}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate New Plan
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Week Navigation */}
      <Card className="glass border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentWeekOffset(currentWeekOffset - 1)}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="text-center">
              <h3 className="font-semibold">
                {startOfWeek.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h3>
              <p className="text-sm text-muted-foreground">
                Week of {startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Calendar View */}
      {loading ? (
        <Card className="glass border-border">
          <CardContent className="p-6 text-center text-sm text-muted-foreground">Loading planner...</CardContent>
        </Card>
      ) : plan.length === 0 ? (
        <Card className="glass border-dashed border-border">
          <CardContent className="p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="text-lg">No workouts scheduled yet</CardTitle>
              <CardDescription>Create a plan or add workouts to populate your week.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => setIsAddOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Workout
              </Button>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={generatePlan}>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-7 gap-2 lg:gap-4">
        {daysOfWeek.map((day, index) => {
          const workout = plan.find((w) => w.day === index)
          const date = getDateForDay(index)
          const todayHighlight = isToday(index)

          return (
            <div key={day} className="space-y-2">
              <div className={cn(
                "text-center py-2 rounded-lg text-sm font-medium",
                todayHighlight ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}>
                <div className="hidden lg:block">{day}</div>
                <div className="lg:hidden">{day.charAt(0)}</div>
                <div className="text-xs">{date.getDate()}</div>
              </div>
              
              {workout && (
                <Card
                  className={cn(
                    "glass cursor-pointer transition-all hover:scale-[1.02] min-h-[120px] lg:min-h-[140px]",
                    workout.completed && "opacity-60",
                    todayHighlight && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedDay(workout)}
                >
                  <CardContent className="p-2 lg:p-3">
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] lg:text-xs mb-2", typeColors[workout.type])}
                    >
                      <span className="hidden lg:inline">{workout.type}</span>
                      <span className="lg:hidden">{workout.type.charAt(0).toUpperCase()}</span>
                    </Badge>
                    <h4 className="font-medium text-xs lg:text-sm line-clamp-2 mb-1">
                      {workout.name}
                    </h4>
                    {workout.duration > 0 && (
                      <div className="flex items-center gap-1 text-[10px] lg:text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {workout.duration}m
                      </div>
                    )}
                    {workout.completed && (
                      <div className="flex items-center gap-1 text-primary text-[10px] lg:text-xs mt-1">
                        <Check className="w-3 h-3" />
                        Done
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )
        })}
      </div>

      {/* Selected Day Detail */}
      {selectedDay && (
        <Card className="glass border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedDay.name}</CardTitle>
                <CardDescription>
                  {fullDaysOfWeek[selectedDay.day]} - {selectedDay.duration} minutes
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={typeColors[selectedDay.type]}>
                  {selectedDay.type}
                </Badge>
                <Button
                  variant={selectedDay.completed ? "outline" : "default"}
                  size="sm"
                  onClick={() => toggleComplete(selectedDay.id)}
                  className={selectedDay.completed ? "" : "bg-primary text-primary-foreground hover:bg-primary/90"}
                >
                  {selectedDay.completed ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Completed
                    </>
                  ) : (
                    "Mark Complete"
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={removeWorkoutFromDay}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          </CardHeader>
          {selectedDay.exercises.length > 0 && (
            <CardContent>
              <h4 className="text-sm font-medium mb-3">Exercises</h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {selectedDay.exercises.map((exercise, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                      {index + 1}
                    </div>
                    <span className="text-sm">{exercise}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass border-border">
          <CardContent className="p-4 text-center">
            <Dumbbell className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{plan.filter(w => w.type === "strength").length}</div>
            <div className="text-sm text-muted-foreground">Strength Days</div>
          </CardContent>
        </Card>
        <Card className="glass border-border">
          <CardContent className="p-4 text-center">
            <Calendar className="w-6 h-6 text-chart-4 mx-auto mb-2" />
            <div className="text-2xl font-bold">{plan.filter(w => w.type === "cardio").length}</div>
            <div className="text-sm text-muted-foreground">Cardio Days</div>
          </CardContent>
        </Card>
        <Card className="glass border-border">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 text-chart-2 mx-auto mb-2" />
            <div className="text-2xl font-bold">{plan.reduce((acc, w) => acc + w.duration, 0)}</div>
            <div className="text-sm text-muted-foreground">Total Minutes</div>
          </CardContent>
        </Card>
        <Card className="glass border-border">
          <CardContent className="p-4 text-center">
            <Check className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{plan.filter(w => w.completed).length}/{plan.length}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
