"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Plus, Dumbbell, Clock, Flame, Trash2, Edit2, ChevronRight, Sparkles } from "lucide-react"
import { onAuthStateChanged } from "firebase/auth"
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase/client"

interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  weight: number
}

interface WorkoutLog {
  id: string
  name: string
  type: "strength" | "cardio"
  date: string
  duration: number
  exercises: Exercise[]
  calories: number
}

const exerciseOptions = [
  "Bench Press",
  "Incline Bench Press",
  "Decline Bench Press",
  "Dumbbell Bench Press",
  "Chest Fly (Machine)",
  "Cable Fly",
  "Push-ups",
  "Dips",
  "Pec Deck",
  "Pull-ups",
  "Chin-ups",
  "Lat Pulldown (Wide)",
  "Lat Pulldown (Close)",
  "Seated Cable Row",
  "Barbell Row",
  "Dumbbell Row",
  "T-Bar Row",
  "Face Pull",
  "Straight-Arm Pulldown",
  "Squat",
  "Front Squat",
  "Hack Squat (Machine)",
  "Leg Press",
  "Leg Extension (Machine)",
  "Seated Leg Curl (Machine)",
  "Lying Leg Curl (Machine)",
  "Romanian Deadlift",
  "Deadlift",
  "Hip Thrust",
  "Glute Bridge",
  "Calf Raise (Standing)",
  "Calf Raise (Seated)",
  "Overhead Press",
  "Dumbbell Shoulder Press",
  "Arnold Press",
  "Lateral Raise",
  "Chest Press",
  "Chest Press (Machine)",
  "Front Raise",
  "Reverse Pec Deck",
  "Upright Row",
  "Bicep Curl",
  "Hammer Curl",
  "Preacher Curl (Machine)",
  "Cable Curl",
  "Tricep Extension",
  "Tricep Pushdown (Cable)",
  "Skull Crushers",
  "Overhead Tricep Extension",
  "Plank",
  "Hanging Leg Raise",
  "Cable Crunch",
  "Russian Twist",
  "Back Extension",
  "Treadmill",
  "Stationary Bike",
  "Rowing Machine",
  "Elliptical",
  "Stair Climber",
  "Assault Bike",
]

const initialWorkoutLogs: WorkoutLog[] = []

export default function WorkoutsPage() {
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>(initialWorkoutLogs)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutLog | null>(null)
  const [newWorkout, setNewWorkout] = useState({
    name: "",
    type: "strength" as "strength" | "cardio",
    exercises: [] as Exercise[],
  })
  const [currentExercise, setCurrentExercise] = useState({
    name: "",
    sets: 3,
    reps: 10,
    weight: 0,
  })
  const [editWorkout, setEditWorkout] = useState<WorkoutLog | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editExercise, setEditExercise] = useState({
    name: "",
    sets: 3,
    reps: 10,
    weight: 0,
  })
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recommendation, setRecommendation] = useState("Log a few workouts to unlock personalized suggestions.")
  const strengthWorkouts = workoutLogs.filter((w) => w.type === "strength")
  const cardioWorkouts = workoutLogs.filter((w) => w.type === "cardio")

  useEffect(() => {
    setMounted(true)
  }, [])

  const buildRecommendation = (logs: WorkoutLog[]) => {
    if (logs.length === 0) {
      return "Log a few workouts to unlock personalized suggestions."
    }
    const latest = logs[0]
    const names = latest.exercises.map((ex) => ex.name.toLowerCase()).join(" ")
    if (["squat", "deadlift", "leg", "calf", "lunge", "hip thrust", "glute"].some((key) => names.includes(key))) {
      return "You hit lower body recently. Consider an upper-body push + pull session next to stay balanced."
    }
    if (["bench", "press", "row", "pull", "lat"].some((key) => names.includes(key))) {
      return "You hit upper body recently. Add a lower-body focus next (squats, hinges, and calves)."
    }
    return "Mix in a strength session with compound lifts and finish with 10-15 minutes of cardio."
  }

  useEffect(() => {
    setRecommendation(buildRecommendation(workoutLogs))
  }, [workoutLogs])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setWorkoutLogs([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const workoutsRef = collection(db, "users", user.uid, "workouts")
        const snapshot = await getDocs(query(workoutsRef, orderBy("createdAt", "desc")))
        const logs = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as Partial<WorkoutLog>
          return {
            id: docSnap.id,
            name: data.name || "Workout",
            type: (data.type as "strength" | "cardio") || "strength",
            date: data.date || new Date().toISOString().split("T")[0],
            duration: data.duration || 0,
            calories: data.calories || 0,
            exercises: Array.isArray(data.exercises) ? data.exercises : [],
          }
        })
        setWorkoutLogs(logs)
      } catch (err) {
        console.error(err)
        setError("Unable to load workouts. Please refresh and try again.")
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const addExercise = () => {
    if (!currentExercise.name) return
    setNewWorkout({
      ...newWorkout,
      exercises: [
        ...newWorkout.exercises,
        { ...currentExercise, id: Date.now().toString() },
      ],
    })
    setCurrentExercise({ name: "", sets: 3, reps: 10, weight: 0 })
  }

  const removeExercise = (id: string) => {
    setNewWorkout({
      ...newWorkout,
      exercises: newWorkout.exercises.filter((e) => e.id !== id),
    })
  }

  const addEditExercise = () => {
    if (!editWorkout || !editExercise.name) return
    const next = {
      ...editWorkout,
      exercises: [...editWorkout.exercises, { ...editExercise, id: Date.now().toString() }],
    }
    setEditWorkout(next)
    setEditExercise({ name: "", sets: 3, reps: 10, weight: 0 })
  }

  const updateEditExercise = (id: string, field: keyof Omit<Exercise, "id">, value: string | number) => {
    if (!editWorkout) return
    setEditWorkout({
      ...editWorkout,
      exercises: editWorkout.exercises.map((ex) =>
        ex.id === id ? { ...ex, [field]: value } : ex
      ),
    })
  }

  const removeEditExercise = (id: string) => {
    if (!editWorkout) return
    setEditWorkout({
      ...editWorkout,
      exercises: editWorkout.exercises.filter((ex) => ex.id !== id),
    })
  }

  const openEdit = (workout: WorkoutLog) => {
    setEditWorkout({ ...workout, exercises: workout.exercises.map((ex) => ({ ...ex })) })
    setIsEditOpen(true)
  }

  const saveWorkout = async () => {
    if (!newWorkout.name || newWorkout.exercises.length === 0) return

    const user = auth.currentUser
    if (!user) {
      setError("You must be signed in to save workouts.")
      return
    }

    setSaving(true)
    setError(null)

    const workoutPayload = {
      name: newWorkout.name,
      type: newWorkout.type,
      date: new Date().toISOString().split("T")[0],
      duration: newWorkout.exercises.length * 15,
      calories: Math.floor(newWorkout.exercises.length * 80 + Math.random() * 100),
      exercises: newWorkout.exercises,
      createdAt: serverTimestamp(),
    }

    try {
      const docRef = await addDoc(collection(db, "users", user.uid, "workouts"), workoutPayload)
      setWorkoutLogs((prev) => [
        {
          id: docRef.id,
          name: workoutPayload.name,
          type: workoutPayload.type,
          date: workoutPayload.date,
          duration: workoutPayload.duration,
          calories: workoutPayload.calories,
          exercises: workoutPayload.exercises,
        },
        ...prev,
      ])
      setNewWorkout({ name: "", type: "strength", exercises: [] })
      setIsDialogOpen(false)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Unable to save workout. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const deleteWorkout = async (id: string) => {
    const user = auth.currentUser
    if (!user) {
      setError("You must be signed in to delete workouts.")
      return
    }

    try {
      await deleteDoc(doc(db, "users", user.uid, "workouts", id))
      setWorkoutLogs((prev) => prev.filter((w) => w.id !== id))
      if (selectedWorkout?.id === id) {
        setSelectedWorkout(null)
      }
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Unable to delete workout. Please try again.")
    }
  }

  const saveEditWorkout = async () => {
    if (!editWorkout) return
    const user = auth.currentUser
    if (!user) {
      setError("You must be signed in to update workouts.")
      return
    }

    if (!editWorkout.name || editWorkout.exercises.length === 0) {
      setError("Add a name and at least one exercise.")
      return
    }

    try {
      await updateDoc(doc(db, "users", user.uid, "workouts", editWorkout.id), {
        name: editWorkout.name,
        type: editWorkout.type,
        duration: editWorkout.duration,
        exercises: editWorkout.exercises,
        updatedAt: serverTimestamp(),
      })
      setWorkoutLogs((prev) => prev.map((w) => (w.id === editWorkout.id ? { ...editWorkout } : w)))
      setIsEditOpen(false)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Unable to update workout. Please try again.")
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Workouts</h1>
          <p className="text-muted-foreground mt-1">
            Log and track your workout sessions
          </p>
          {error && (
            <p className="mt-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
        {mounted ? (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Log Workout
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Log New Workout</DialogTitle>
              <DialogDescription>
                Add exercises to your workout session
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="workout-name">Workout Name</Label>
                <Input
                  id="workout-name"
                  placeholder="e.g., Upper Body Strength"
                  value={newWorkout.name}
                  onChange={(e) => setNewWorkout({ ...newWorkout, name: e.target.value })}
                  className="bg-secondary border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Workout Type</Label>
                <Select
                  value={newWorkout.type}
                  onValueChange={(value) => setNewWorkout({ ...newWorkout, type: value as "strength" | "cardio" })}
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strength">Strength</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Add Exercise Form */}
              <div className="space-y-4 p-4 rounded-xl bg-secondary/50">
                <h4 className="font-medium">Add Exercise</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Exercise</Label>
                    <Select
                      value={currentExercise.name}
                      onValueChange={(value) => setCurrentExercise({ ...currentExercise, name: value })}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="Select exercise" />
                      </SelectTrigger>
                      <SelectContent>
                        {exerciseOptions.map((exercise) => (
                          <SelectItem key={exercise} value={exercise}>
                            {exercise}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Sets</Label>
                    <Input
                      type="number"
                      value={currentExercise.sets}
                      onChange={(e) => setCurrentExercise({ ...currentExercise, sets: parseInt(e.target.value) || 0 })}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <Label>Reps</Label>
                    <Input
                      type="number"
                      value={currentExercise.reps}
                      onChange={(e) => setCurrentExercise({ ...currentExercise, reps: parseInt(e.target.value) || 0 })}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Weight (kg)</Label>
                    <Input
                      type="number"
                      value={currentExercise.weight}
                      onChange={(e) => setCurrentExercise({ ...currentExercise, weight: parseInt(e.target.value) || 0 })}
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addExercise}
                  disabled={!currentExercise.name}
                  className="w-full bg-transparent"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exercise
                </Button>
              </div>

              {/* Exercise List */}
              {newWorkout.exercises.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Exercises ({newWorkout.exercises.length})</h4>
                  {newWorkout.exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                    >
                      <div>
                        <div className="font-medium">{exercise.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {exercise.sets} sets x {exercise.reps} reps @ {exercise.weight} kg
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExercise(exercise.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button
                onClick={saveWorkout}
                disabled={saving || !newWorkout.name || newWorkout.exercises.length === 0}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {saving ? "Saving..." : "Save Workout"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        ) : (
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" disabled>
            <Plus className="w-4 h-4 mr-2" />
            Log Workout
          </Button>
        )}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Workout</DialogTitle>
              <DialogDescription>Update sets, reps, and exercises.</DialogDescription>
            </DialogHeader>
            {editWorkout ? (
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label>Workout Name</Label>
                  <Input
                    value={editWorkout.name}
                    onChange={(e) => setEditWorkout({ ...editWorkout, name: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={editWorkout.type}
                      onValueChange={(value) => setEditWorkout({ ...editWorkout, type: value as "strength" | "cardio" })}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="strength">Strength</SelectItem>
                        <SelectItem value="cardio">Cardio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (min)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={editWorkout.duration}
                      onChange={(e) => setEditWorkout({ ...editWorkout, duration: Number(e.target.value) || 0 })}
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>

                <div className="space-y-4 p-4 rounded-xl bg-secondary/50">
                  <h4 className="font-medium">Add Exercise</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label>Exercise</Label>
                      <Select
                        value={editExercise.name}
                        onValueChange={(value) => setEditExercise({ ...editExercise, name: value })}
                      >
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue placeholder="Select exercise" />
                        </SelectTrigger>
                        <SelectContent>
                          {exerciseOptions.map((exercise) => (
                            <SelectItem key={exercise} value={exercise}>
                              {exercise}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Sets</Label>
                      <Input
                        type="number"
                        value={editExercise.sets}
                        onChange={(e) => setEditExercise({ ...editExercise, sets: parseInt(e.target.value) || 0 })}
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div>
                      <Label>Reps</Label>
                      <Input
                        type="number"
                        value={editExercise.reps}
                        onChange={(e) => setEditExercise({ ...editExercise, reps: parseInt(e.target.value) || 0 })}
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Weight (kg)</Label>
                      <Input
                        type="number"
                        value={editExercise.weight}
                        onChange={(e) => setEditExercise({ ...editExercise, weight: parseInt(e.target.value) || 0 })}
                        className="bg-secondary border-border"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addEditExercise}
                    disabled={!editExercise.name}
                    className="w-full bg-transparent"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Exercise
                  </Button>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Exercises ({editWorkout.exercises.length})</h4>
                  {editWorkout.exercises.map((exercise) => (
                    <div key={exercise.id} className="grid grid-cols-5 gap-3 items-center p-3 rounded-lg bg-secondary/50">
                      <Input
                        className="col-span-2 bg-secondary border-border"
                        value={exercise.name}
                        onChange={(e) => updateEditExercise(exercise.id, "name", e.target.value)}
                      />
                      <Input
                        type="number"
                        className="bg-secondary border-border"
                        value={exercise.sets}
                        onChange={(e) => updateEditExercise(exercise.id, "sets", parseInt(e.target.value) || 0)}
                      />
                      <Input
                        type="number"
                        className="bg-secondary border-border"
                        value={exercise.reps}
                        onChange={(e) => updateEditExercise(exercise.id, "reps", parseInt(e.target.value) || 0)}
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          className="bg-secondary border-border"
                          value={exercise.weight}
                          onChange={(e) => updateEditExercise(exercise.id, "weight", parseInt(e.target.value) || 0)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeEditExercise(exercise.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={saveEditWorkout}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Save Changes
                </Button>
              </div>
            ) : (
              <div className="p-6 text-sm text-muted-foreground">Select a workout to edit.</div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* AI Recommendation Banner */}
      <Card className="glass border-primary/30 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">AI Recommendations</h3>
                <p className="text-sm text-muted-foreground">
                  {recommendation}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-primary/30 hover:bg-primary/10 bg-transparent"
              onClick={() => setRecommendation(buildRecommendation(workoutLogs))}
            >
              Refresh Recommendation
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Workout History */}
      {mounted ? (
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="all">All Workouts</TabsTrigger>
          <TabsTrigger value="strength">Strength</TabsTrigger>
          <TabsTrigger value="cardio">Cardio</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <Card className="glass border-border">
              <CardContent className="p-10 text-center text-sm text-muted-foreground">
                Loading workouts...
              </CardContent>
            </Card>
          ) : workoutLogs.length === 0 ? (
            <Card className="glass border-dashed border-border">
              <CardContent className="p-10 text-center text-sm text-muted-foreground space-y-3">
                <p>No workouts logged yet.</p>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Log Your First Workout
                </Button>
              </CardContent>
            </Card>
          ) : (
            workoutLogs.map((workout) => (
              <Card key={workout.id} className="glass border-border">
                <CardContent className="p-0">
                  <div
                    className="p-6 cursor-pointer hover:bg-secondary/30 transition-colors"
                    onClick={() => setSelectedWorkout(selectedWorkout?.id === workout.id ? null : workout)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                          <Dumbbell className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{workout.name}</h3>
                          <span className="text-xs text-muted-foreground uppercase tracking-wide">{workout.type}</span>
                          <p className="text-sm text-muted-foreground">
                            {new Date(workout.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {workout.duration} min
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Flame className="w-4 h-4" />
                          {workout.calories} kcal
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(workout) }}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteWorkout(workout.id)
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Exercise List */}
                  {selectedWorkout?.id === workout.id && (
                    <div className="px-6 pb-6 border-t border-border pt-4">
                      <h4 className="text-sm font-medium mb-3">
                        Exercises ({workout.exercises.length})
                      </h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {workout.exercises.map((exercise) => (
                          <div
                            key={exercise.id}
                            className="p-3 rounded-lg bg-secondary/50 flex items-center justify-between"
                          >
                            <span className="font-medium">{exercise.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {exercise.sets}x{exercise.reps} @ {exercise.weight} kg
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="strength">
          {strengthWorkouts.length === 0 ? (
            <Card className="glass border-border">
              <CardContent className="p-8 text-center text-muted-foreground">
                No strength workouts yet.
              </CardContent>
            </Card>
          ) : (
            strengthWorkouts.map((workout) => (
              <Card key={workout.id} className="glass border-border">
                <CardContent className="p-0">
                  <div
                    className="p-6 cursor-pointer hover:bg-secondary/30 transition-colors"
                    onClick={() => setSelectedWorkout(selectedWorkout?.id === workout.id ? null : workout)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                          <Dumbbell className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{workout.name}</h3>
                          <span className="text-xs text-muted-foreground uppercase tracking-wide">{workout.type}</span>
                          <p className="text-sm text-muted-foreground">
                            {new Date(workout.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {workout.duration} min
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Flame className="w-4 h-4" />
                          {workout.calories} kcal
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(workout) }}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteWorkout(workout.id)
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="cardio">
          {cardioWorkouts.length === 0 ? (
            <Card className="glass border-border">
              <CardContent className="p-8 text-center text-muted-foreground">
                No cardio workouts yet.
              </CardContent>
            </Card>
          ) : (
            cardioWorkouts.map((workout) => (
              <Card key={workout.id} className="glass border-border">
                <CardContent className="p-0">
                  <div
                    className="p-6 cursor-pointer hover:bg-secondary/30 transition-colors"
                    onClick={() => setSelectedWorkout(selectedWorkout?.id === workout.id ? null : workout)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                          <Dumbbell className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{workout.name}</h3>
                          <span className="text-xs text-muted-foreground uppercase tracking-wide">{workout.type}</span>
                          <p className="text-sm text-muted-foreground">
                            {new Date(workout.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {workout.duration} min
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Flame className="w-4 h-4" />
                          {workout.calories} kcal
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(workout) }}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteWorkout(workout.id)
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
      ) : (
        <Card className="glass border-border">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            Loading workouts...
          </CardContent>
        </Card>
      )}
    </div>
  )
}
