import { NextRequest, NextResponse } from 'next/server'
import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"

if (!process.env.GROQ_API_KEY) {
  console.warn("GROQ_API_KEY environment variable is not set. AI features will not work properly.")
}

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key is not configured' },
        { status: 500 }
      )
    }

    const { prompt, context } = await req.json()

    if (!prompt || !context) {
      return NextResponse.json(
        { error: 'Missing prompt or context' },
        { status: 400 }
      )
    }

    const contextMessages = context.recentMessages
      .slice(-5)
      .map((msg: any) => `${msg.senderName}: ${msg.content}`)
      .join("\n")

    const systemPrompt = `You are CollabAI, a helpful AI assistant in a collaborative chat room called "${context.roomName}". 
You help users with questions, provide information, assist with tasks, and facilitate collaboration.

Recent conversation context:
${contextMessages}

Guidelines:
- Be helpful, friendly, and concise
- Provide accurate information
- If you're unsure about something, say so
- Help facilitate collaboration between team members
- Keep responses conversational and appropriate for a chat environment`

    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      system: systemPrompt,
      prompt: prompt,
    })

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error('Error generating AI response:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    )
  }
}