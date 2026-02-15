import { NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase/admin"

export const runtime = "nodejs"

function getDocId(endpoint: string) {
  return Buffer.from(endpoint).toString("base64url")
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || ""
    const token = authHeader.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await adminAuth.verifyIdToken(token)
    const body = await req.json()
    const endpoint = body.endpoint

    if (!endpoint) {
      return NextResponse.json({ error: "Missing endpoint" }, { status: 400 })
    }

    const docId = getDocId(endpoint)
    await adminDb
      .collection("users")
      .doc(decoded.uid)
      .collection("pushSubscriptions")
      .doc(docId)
      .delete()

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: "Unable to remove subscription" }, { status: 500 })
  }
}
