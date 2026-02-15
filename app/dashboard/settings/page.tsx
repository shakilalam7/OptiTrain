"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Bell,
  Shield,
  Palette,
  Activity,
  Camera,
  Mail,
  Phone,
  MapPin,
  Target,
  Dumbbell,
  Scale,
  Ruler,
  Calendar,
} from "lucide-react"
import {
  EmailAuthProvider,
  PhoneAuthProvider,
  RecaptchaVerifier,
  multiFactor,
  onAuthStateChanged,
  reauthenticateWithCredential,
  deleteUser,
  updateEmail,
  updatePassword,
  updateProfile,
} from "firebase/auth"
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase/client"

export default function SettingsPage() {
  const { setTheme } = useTheme()
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null)

  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [securityMessage, setSecurityMessage] = useState<string | null>(null)
  const [mfaMessage, setMfaMessage] = useState<string | null>(null)
  const [mfaError, setMfaError] = useState<string | null>(null)
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [mfaPhone, setMfaPhone] = useState("")
  const [mfaCode, setMfaCode] = useState("")
  const [mfaVerificationId, setMfaVerificationId] = useState("")
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
  })
  const [fitness, setFitness] = useState({
    goal: "muscle-gain",
    experienceLevel: "beginner",
    weight: "",
    height: "",
    targetWeight: "",
    workoutsPerWeek: "3",
  })
  const [notifications, setNotifications] = useState({
    workoutReminders: true,
    progressUpdates: true,
    aiInsights: true,
    weeklyReports: true,
    emailNotifications: false,
    pushNotifications: true,
  })
  const [appearance, setAppearance] = useState({
    theme: "dark",
    compactMode: false,
    animationsEnabled: true,
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return

      setMfaEnabled(Boolean(user.multiFactor?.enrolledFactors?.length))

      try {
        const profileDoc = await getDoc(doc(db, "users", user.uid))
        if (profileDoc.exists()) {
          const data = profileDoc.data()
          setProfile({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || user.email || "",
            phone: data.phone || "",
            location: data.location || "",
          })
          setFitness({
            goal: data.fitness?.goal || "muscle-gain",
            experienceLevel: data.fitness?.experienceLevel || "beginner",
            weight: data.fitness?.weight || "",
            height: data.fitness?.height || "",
            targetWeight: data.fitness?.targetWeight || "",
            workoutsPerWeek: data.fitness?.workoutsPerWeek || "3",
          })
          setNotifications({
            workoutReminders: data.notifications?.workoutReminders ?? true,
            progressUpdates: data.notifications?.progressUpdates ?? true,
            aiInsights: data.notifications?.aiInsights ?? true,
            weeklyReports: data.notifications?.weeklyReports ?? true,
            emailNotifications: data.notifications?.emailNotifications ?? false,
            pushNotifications: data.notifications?.pushNotifications ?? true,
          })
          const storedTheme = data.appearance?.theme === "system" ? "dark" : data.appearance?.theme
          const nextAppearance = {
            theme: storedTheme || "dark",
            compactMode: data.appearance?.compactMode ?? false,
            animationsEnabled: data.appearance?.animationsEnabled ?? true,
          }
          const root = document.documentElement
          if (nextAppearance.theme === "light") {
            root.classList.remove("dark")
          } else {
            root.classList.add("dark")
          }
          setAppearance(nextAppearance)
          setTheme(nextAppearance.theme)
        } else {
          const [firstName, ...rest] = (user.displayName || "").split(" ")
          setProfile({
            firstName: firstName || "",
            lastName: rest.join(" "),
            email: user.email || "",
            phone: "",
            location: "",
          })
        }
      } catch (err) {
        setError("Unable to load settings. Please refresh and try again.")
      }
    })

    return () => unsubscribe()
  }, [setTheme])

  const handleSave = async () => {
    const user = auth.currentUser
    if (!user) {
      setError("You must be signed in to save settings.")
      return
    }

    setSaving(true)
    setError(null)

    try {
      if (profile.email && profile.email !== user.email) {
        await updateEmail(user, profile.email)
      }

      const displayName = `${profile.firstName} ${profile.lastName}`.trim()
      if (displayName) {
        await updateProfile(user, { displayName })
      }

      await setDoc(
        doc(db, "users", user.uid),
        {
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone,
          location: profile.location,
          fitness: {
            goal: fitness.goal,
            experienceLevel: fitness.experienceLevel,
            weight: fitness.weight,
            height: fitness.height,
            targetWeight: fitness.targetWeight,
            workoutsPerWeek: fitness.workoutsPerWeek,
          },
          notifications: {
            ...notifications,
          },
          appearance: {
            ...appearance,
          },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError("Unable to save settings. If you changed email, please re-login and try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAppearance = async (nextAppearance: typeof appearance) => {
    const user = auth.currentUser
    if (!user) {
      setError("You must be signed in to save appearance.")
      return
    }
    const root = document.documentElement
    if (nextAppearance.theme === "light") {
      root.classList.remove("dark")
    } else {
      root.classList.add("dark")
    }
    setAppearance(nextAppearance)
    setTheme(nextAppearance.theme)
    await setDoc(
      doc(db, "users", user.uid),
      { appearance: nextAppearance, updatedAt: serverTimestamp() },
      { merge: true }
    )
  }

  const handleSaveNotifications = async (nextNotifications: typeof notifications) => {
    const user = auth.currentUser
    if (!user) {
      setError("You must be signed in to save notifications.")
      return
    }
    setNotifications(nextNotifications)
    await setDoc(
      doc(db, "users", user.uid),
      { notifications: nextNotifications, updatedAt: serverTimestamp() },
      { merge: true }
    )
  }

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; i += 1) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  const handleTogglePushNotifications = async (checked: boolean) => {
    const user = auth.currentUser
    if (!user) {
      setError("You must be signed in to manage notifications.")
      return
    }

    if (!("Notification" in window)) {
      setError("Notifications are not supported by this browser.")
      return
    }

    if (checked) {
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        setError("Please allow notifications in your browser settings.")
        return
      }

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!publicKey) {
        setError("Missing VAPID public key.")
        return
      }

      const registration = await navigator.serviceWorker.register("/sw.js")
      const applicationServerKey = urlBase64ToUint8Array(publicKey)
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      })
      const token = await user.getIdToken()
      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subscription }),
      })

      await handleSaveNotifications({ ...notifications, pushNotifications: true })
      return
    }

    const registration = await navigator.serviceWorker.getRegistration()
    const subscription = await registration?.pushManager.getSubscription()
    if (subscription) {
      const token = await user.getIdToken()
      await fetch("/api/notifications/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      })
      await subscription.unsubscribe()
    }

    await handleSaveNotifications({ ...notifications, pushNotifications: false })
  }

  const handleSendTestNotification = () => {
    if (!("Notification" in window)) {
      setError("Notifications are not supported by this browser.")
      return
    }

    if (Notification.permission !== "granted") {
      setError("Please allow notifications in your browser settings.")
      return
    }

    const user = auth.currentUser
    if (!user) {
      setError("You must be signed in to send a test notification.")
      return
    }

    user.getIdToken().then((token) =>
      fetch("/api/notifications/test", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    )
  }


  const handleChangePassword = async () => {
    const user = auth.currentUser
    setSecurityMessage(null)

    if (!user || !user.email) {
      setSecurityMessage("You must be signed in to change your password.")
      return
    }

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setSecurityMessage("Please enter your current and new password.")
      return
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, passwordForm.currentPassword)
      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, passwordForm.newPassword)
      setPasswordForm({ currentPassword: "", newPassword: "" })
      setSecurityMessage("Password updated successfully.")
    } catch (err) {
      setSecurityMessage("Unable to update password. Please check your current password.")
    }
  }

  const handleSendMfaCode = async () => {
    const user = auth.currentUser
    setMfaError(null)
    setMfaMessage(null)

    if (!user) {
      setMfaError("You must be signed in to enable 2FA.")
      return
    }

    if (!mfaPhone) {
      setMfaError("Please enter your phone number.")
      return
    }

    try {
      if (!recaptchaRef.current) {
        recaptchaRef.current = new RecaptchaVerifier(auth, "mfa-recaptcha", { size: "invisible" })
      }
      const session = await multiFactor(user).getSession()
      const phoneProvider = new PhoneAuthProvider(auth)
      const verificationId = await phoneProvider.verifyPhoneNumber(
        { phoneNumber: mfaPhone, session },
        recaptchaRef.current
      )
      setMfaVerificationId(verificationId)
      setMfaMessage("Verification code sent.")
    } catch (err) {
      setMfaError("Unable to send verification code. Please check the phone number.")
    }
  }

  const handleVerifyMfa = async () => {
    const user = auth.currentUser
    setMfaError(null)
    setMfaMessage(null)

    if (!user) {
      setMfaError("You must be signed in to enable 2FA.")
      return
    }

    if (!mfaVerificationId || !mfaCode) {
      setMfaError("Please enter the verification code.")
      return
    }

    try {
      const credential = PhoneAuthProvider.credential(mfaVerificationId, mfaCode)
      await multiFactor(user).enroll(credential, "SMS")
      setMfaEnabled(true)
      setMfaCode("")
      setMfaMessage("Two-factor authentication enabled.")
    } catch (err) {
      setMfaError("Unable to enable 2FA. Please try again.")
    }
  }

  const handleDeleteAccount = async () => {
    const user = auth.currentUser
    setDeleteError(null)

    if (!user) {
      setDeleteError("You must be signed in to delete your account.")
      return
    }

    const confirmed = window.confirm(
      "This will permanently delete your account and all data. This cannot be undone. Continue?"
    )
    if (!confirmed) return

    setDeleting(true)
    try {
      await deleteDoc(doc(db, "users", user.uid))
      await deleteUser(user)
      window.location.href = "/"
    } catch (err) {
      setDeleteError("Unable to delete account. Please re-login and try again.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account preferences and app settings
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="glass border border-border">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="fitness" className="gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Fitness</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute -bottom-1 -right-1 rounded-full w-8 h-8"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                <div>
                  <h3 className="font-semibold">{profile.firstName} {profile.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                  <Badge variant="secondary" className="mt-2">Pro Member</Badge>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
              </div>
              <Button onClick={handleSave} className="w-full sm:w-auto" disabled={saving}>
                {saving ? "Saving..." : saved ? "Saved" : "Save Profile"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fitness Tab */}
        <TabsContent value="fitness" className="space-y-6">
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Fitness Goals
              </CardTitle>
              <CardDescription>
                Configure your fitness objectives and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Primary Goal
                  </Label>
                  <Select
                    value={fitness.goal}
                    onValueChange={(value) => setFitness({ ...fitness, goal: value })}
                  >
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="muscle-gain">Build Muscle</SelectItem>
                      <SelectItem value="weight-loss">Lose Weight</SelectItem>
                      <SelectItem value="strength">Increase Strength</SelectItem>
                      <SelectItem value="endurance">Improve Endurance</SelectItem>
                      <SelectItem value="flexibility">Enhance Flexibility</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4" />
                    Experience Level
                  </Label>
                  <Select
                    value={fitness.experienceLevel}
                    onValueChange={(value) => setFitness({ ...fitness, experienceLevel: value })}
                  >
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    Current Weight (kg)
                  </Label>
                  <Input
                    type="number"
                    value={fitness.weight}
                    onChange={(e) => setFitness({ ...fitness, weight: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Target Weight (kg)
                  </Label>
                  <Input
                    type="number"
                    value={fitness.targetWeight}
                    onChange={(e) => setFitness({ ...fitness, targetWeight: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Ruler className="w-4 h-4" />
                    Height
                  </Label>
                  <Input
                    value={fitness.height}
                    onChange={(e) => setFitness({ ...fitness, height: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Workouts Per Week
                  </Label>
                  <Select
                    value={fitness.workoutsPerWeek}
                    onValueChange={(value) => setFitness({ ...fitness, workoutsPerWeek: value })}
                  >
                    <SelectTrigger className="bg-secondary/50">
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
              </div>
              <Button onClick={handleSave} className="w-full sm:w-auto" disabled={saving}>
                {saving ? "Saving..." : saved ? "Saved" : "Save Fitness"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how and when you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div>
                    <div className="font-medium">Workout Reminders</div>
                    <div className="text-sm text-muted-foreground">Get reminded about upcoming workouts</div>
                  </div>
                  <Switch
                    checked={notifications.workoutReminders}
                    onCheckedChange={(checked) =>
                      handleSaveNotifications({ ...notifications, workoutReminders: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div>
                    <div className="font-medium">Progress Updates</div>
                    <div className="text-sm text-muted-foreground">Notifications about your fitness progress</div>
                  </div>
                  <Switch
                    checked={notifications.progressUpdates}
                    onCheckedChange={(checked) =>
                      handleSaveNotifications({ ...notifications, progressUpdates: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div>
                    <div className="font-medium">AI Insights</div>
                    <div className="text-sm text-muted-foreground">Personalized tips from your AI coach</div>
                  </div>
                  <Switch
                    checked={notifications.aiInsights}
                    onCheckedChange={(checked) =>
                      handleSaveNotifications({ ...notifications, aiInsights: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div>
                    <div className="font-medium">Weekly Reports</div>
                    <div className="text-sm text-muted-foreground">Summary of your weekly activity</div>
                  </div>
                  <Switch
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) =>
                      handleSaveNotifications({ ...notifications, weeklyReports: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div>
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-muted-foreground">Receive notifications via email</div>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) =>
                      handleSaveNotifications({ ...notifications, emailNotifications: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div>
                    <div className="font-medium">Push Notifications</div>
                    <div className="text-sm text-muted-foreground">Browser push notifications</div>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={handleTogglePushNotifications}
                  />
                </div>
                <Button variant="outline" onClick={handleSendTestNotification}>
                  Send Test Notification
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Appearance Settings
              </CardTitle>
              <CardDescription>
                Customize how the app looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["light", "dark"] as const).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => handleSaveAppearance({ ...appearance, theme })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          appearance.theme === theme
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="text-sm font-medium capitalize">{theme}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div>
                    <div className="font-medium">Compact Mode</div>
                    <div className="text-sm text-muted-foreground">Reduce spacing for more content</div>
                  </div>
                  <Switch
                    checked={appearance.compactMode}
                    onCheckedChange={(checked) =>
                      handleSaveAppearance({ ...appearance, compactMode: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div>
                    <div className="font-medium">Animations</div>
                    <div className="text-sm text-muted-foreground">Enable smooth transitions and effects</div>
                  </div>
                  <Switch
                    checked={appearance.animationsEnabled}
                    onCheckedChange={(checked) =>
                      handleSaveAppearance({ ...appearance, animationsEnabled: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security and privacy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-secondary/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Password</div>
                      <div className="text-sm text-muted-foreground">Update your password regularly</div>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="bg-secondary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="bg-secondary/50"
                      />
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleChangePassword}>
                    Change Password
                  </Button>
                  {securityMessage && (
                    <p className="text-sm text-muted-foreground">{securityMessage}</p>
                  )}
                </div>

                <div className="p-4 rounded-lg bg-secondary/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Two-Factor Authentication</div>
                      <div className="text-sm text-muted-foreground">
                        Add an extra layer of security (SMS)
                      </div>
                    </div>
                    <Badge variant={mfaEnabled ? "secondary" : "outline"}>
                      {mfaEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>

                  {!mfaEnabled && (
                    <>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="mfaPhone">Phone Number</Label>
                          <Input
                            id="mfaPhone"
                            type="tel"
                            placeholder="Enter your number"
                            value={mfaPhone}
                            onChange={(e) => setMfaPhone(e.target.value)}
                            className="bg-secondary/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mfaCode">Verification Code</Label>
                          <Input
                            id="mfaCode"
                            type="text"
                            value={mfaCode}
                            onChange={(e) => setMfaCode(e.target.value)}
                            className="bg-secondary/50"
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button variant="outline" onClick={handleSendMfaCode}>
                          Send Code
                        </Button>
                        <Button onClick={handleVerifyMfa}>
                          Enable 2FA
                        </Button>
                      </div>
                      {mfaError && <p className="text-sm text-destructive">{mfaError}</p>}
                      {mfaMessage && <p className="text-sm text-muted-foreground">{mfaMessage}</p>}
                      <div id="mfa-recaptcha" />
                    </>
                  )}
                </div>

                <Separator />

                <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-destructive">Delete Account</div>
                      <div className="text-sm text-muted-foreground">Permanently delete your account and data</div>
                    </div>
                    <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleting}>
                      {deleting ? "Deleting..." : "Delete Account"}
                    </Button>
                  </div>
                  {deleteError && <p className="text-sm text-destructive mt-2">{deleteError}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
