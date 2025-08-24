"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Paperclip, Loader2, Bot } from "lucide-react"
import { messageService } from "@/lib/message-service"
import { aiService } from "@/lib/ai-service"
import { useAuthContext } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import { AIToggle } from "./ai-toggle"
import type { Message } from "@/types/message"
import { cn } from "@/lib/utils"

interface MessageInputProps {
  roomId: string
  roomName: string
  recentMessages: Message[]
  onMessageSent?: () => void
  onAITyping?: (typing: boolean) => void
}

export function MessageInput({ roomId, roomName, recentMessages, onMessageSent, onAITyping }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFileUploading, setIsFileUploading] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(true)
  const [isAIResponding, setIsAIResponding] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuthContext()
  const { toast } = useToast()
  const isMobile = useMobile()

  const handleSendMessage = async () => {
    if (!user || !message.trim() || isLoading) return

    const messageContent = message.trim()
    const shouldTriggerAI = aiEnabled && aiService.shouldTriggerAI(messageContent)

    setIsLoading(true)
    try {
      await messageService.sendMessage({
        roomId,
        senderId: user.uid,
        senderName: user.displayName || "Anonymous",
        senderAvatar: user.photoURL || undefined,
        content: messageContent,
      })

      setMessage("")
      onMessageSent?.()

      if (shouldTriggerAI) {
        setIsAIResponding(true)
        onAITyping?.(true)
        const aiPrompt = aiService.extractAIPrompt(messageContent)
        const context = {
          roomId,
          roomName,
          recentMessages: recentMessages.slice(-5).map((msg) => ({
            senderName: msg.senderName,
            content: msg.content,
            timestamp: msg.timestamp,
          })),
        }

        setTimeout(async () => {
          try {
            await aiService.sendAIResponse(roomId, aiPrompt, context)
          } catch (error) {
            console.error("AI response error:", error)
            toast({
              title: "AI Error",
              description: "Failed to get AI response. Please check your API key configuration.",
              variant: "destructive",
            })
          } finally {
            setIsAIResponding(false)
            onAITyping?.(false)
          }
        }, 1500)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const isAIMessage = aiEnabled && aiService.shouldTriggerAI(message)

  return (
    <div className="border-t bg-background/95 backdrop-blur-sm">
      {/* AI Toggle - Desktop */}
      {!isMobile && (
        <div className="px-4 py-3 border-b bg-card/30">
          <div className="flex items-center justify-between">
            <AIToggle isEnabled={aiEnabled} onToggle={setAiEnabled} />
            {isAIResponding && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                <Bot className="h-4 w-4" />
                <span>CollabAI is thinking...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="flex items-end gap-2 p-4">
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={aiEnabled ? "Type a message... (use @ai for AI assistance)" : "Type a message..."}
            className={cn(
              "pr-10 transition-all duration-200",
              isAIMessage && "border-accent bg-accent/5 focus:border-accent focus:ring-accent",
            )}
            disabled={isLoading}
          />
          {isAIMessage && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Bot className="h-4 w-4 text-accent animate-pulse" />
            </div>
          )}
        </div>

        <Button
          onClick={handleSendMessage}
          disabled={!message.trim() || isLoading}
          className="flex-shrink-0 transition-all duration-200"
          size="icon"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile AI Status */}
      {isMobile && isAIResponding && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
            <Bot className="h-4 w-4" />
            <span>CollabAI is thinking...</span>
          </div>
        </div>
      )}
    </div>
  )
}