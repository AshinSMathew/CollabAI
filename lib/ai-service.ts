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
      const response = await fetch('/api/ai/response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, context }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.response
    } catch (error) {
      console.error("Error generating AI response:", error)
      return "I'm sorry, I'm having trouble responding right now. Please try again later."
    }
  },

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