import { NextResponse } from "next/server"
import OpenAI from "openai"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function buildPrompt(messages: Array<{ role: string; content: string }>, profile: any) {
  const profileBlock = profile
    ? `User profile:
- Name: ${profile.name || "Unknown"}
- Goal: ${profile.fitness?.goal || "Unknown"}
- Experience: ${profile.fitness?.experienceLevel || "Unknown"}
- Workouts per week: ${profile.fitness?.workoutsPerWeek || "Unknown"}
- Weight: ${profile.fitness?.weight || "Unknown"}
- Target weight: ${profile.fitness?.targetWeight || "Unknown"}
- Height: ${profile.fitness?.height || "Unknown"}
- Location: ${profile.location || "Unknown"}`
    : "User profile: Not available"

  const conversation = messages
    .slice(-12)
    .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
    .join("\n")

  return `You are an AI fitness coach. Be concise, helpful, and safe. 
Never invent user data. If the user asks for metrics or plans that require missing info, ask a clarifying question first.
Avoid medical advice; suggest seeing a professional for injuries or conditions.

${profileBlock}

Conversation:
${conversation}

Assistant:`
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      )
    }

    const body = await req.json()
    const messages = Array.isArray(body.messages) ? body.messages : []
    const profile = body.profile || null

    const prompt = buildPrompt(messages, profile)

    const response = await client.responses.create({
      model: "gpt-5-mini",
      input: prompt,
    })

    const content =
      response.output_text ||
      response.output?.[0]?.content?.[0]?.text ||
      "Sorry, I couldn't generate a response."

    return NextResponse.json({ content })
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to generate response" },
      { status: 500 }
    )
  }
}
