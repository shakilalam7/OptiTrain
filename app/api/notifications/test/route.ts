import { NextResponse } from "next/server"
import webpush from "web-push"
import { adminAuth, adminDb } from "@/lib/firebase/admin"

export const runtime = "nodejs"

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
const vapidSubject = process.env.VAPID_SUBJECT

if (vapidPublicKey && vapidPrivateKey && vapidSubject) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
}

export async function POST(req: Request) {
  try {
    if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
      return NextResponse.json({ error: "Missing VAPID config" }, { status: 500 })
    }

    const authHeader = req.headers.get("authorization") || ""
    const token = authHeader.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await adminAuth.verifyIdToken(token)
    const subsSnapshot = await adminDb
      .collection("users")
      .doc(decoded.uid)
      .collection("pushSubscriptions")
      .get()

    const payload = JSON.stringify({
      title: "OptiTrain",
      body: "Notifications are enabled. You’ll receive workout reminders here.",
      url: "/dashboard",
    })

    const sends = subsSnapshot.docs.map(async (doc) => {
      const data = doc.data()
      try {
        await webpush.sendNotification(data.subscription, payload)
      } catch (err: any) {
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          await doc.ref.delete()
        }
      }
    })

    await Promise.all(sends)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: "Unable to send notification" }, { status: 500 })
  }
}
