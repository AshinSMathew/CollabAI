import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { messageService } from "./message-service"

export interface AIContext {
  roomId: string
  roomName: string
  recentMessages: Array<{
    senderName: string
    content: string
    timestamp: Date
  }>
}

export const aiService = {
  async generateResponse(prompt: string, context: AIContext): Promise<string> {
    try {
      const contextMessages = context.recentMessages
        .slice(-5) // Last 5 messages for context
        .map((msg) => `${msg.senderName}: ${msg.content}`)
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
        //maxTokens: 500,
      })

      return text
    } catch (error) {
      console.error("Error generating AI response:", error)
      return "I'm sorry, I'm having trouble responding right now. Please try again later."
    }
  },

  // Send AI response to the chat
  async sendAIResponse(roomId: string, prompt: string, context: AIContext): Promise<void> {
    try {
      const response = await this.generateResponse(prompt, context)

      await messageService.sendMessage({
        roomId,
        senderId: "ai-assistant",
        senderName: "CollabAI",
        senderAvatar: "/ai-robot-assistant.png",
        content: response,
        type: "ai",
      })
    } catch (error) {
      console.error("Error sending AI response:", error)
      // Send error message
      await messageService.sendMessage({
        roomId,
        senderId: "ai-assistant",
        senderName: "CollabAI",
        senderAvatar: "/ai-robot-assistant.png",
        content: "I encountered an error while processing your request. Please try again.",
        type: "ai",
      })
    }
  },

  // Check if message should trigger AI response
  shouldTriggerAI(content: string): boolean {
    const lowerContent = content.toLowerCase()
    return (
      lowerContent.includes("@ai") ||
      lowerContent.includes("@collab") ||
      lowerContent.includes("@assistant") ||
      lowerContent.startsWith("ai,") ||
      lowerContent.startsWith("hey ai") ||
      lowerContent.startsWith("ai:")
    )
  },

  // Extract AI prompt from message
  extractAIPrompt(content: string): string {
    const prompt = content
      .replace(/@ai/gi, "")
      .replace(/@collab/gi, "")
      .replace(/@assistant/gi, "")
      .replace(/^ai[,:]/gi, "")
      .replace(/^hey ai[,:]/gi, "")
      .trim()

    return prompt || "Hello! How can I help you?"
  },
}