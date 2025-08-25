"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bot, Lock } from "lucide-react"
import type { Message } from "@/types/message"
import { cn } from "@/lib/utils"
import { encryptionService } from "@/lib/encryption-service"
import { useState } from "react"

interface MessageBubbleProps {
  message: Message
  isCurrentUser: boolean
  showAvatar?: boolean
}

export function MessageBubble({ message, isCurrentUser, showAvatar = true }: MessageBubbleProps) {
  const isAI = message.type === "ai" || message.senderId === "ai-assistant"
  const [showEncryptionIndicator, setShowEncryptionIndicator] = useState(false)

  // Check if message is encrypted
  const isEncrypted = message.isEncrypted && encryptionService.isLikelyEncrypted(message.content)

  return (
    <div
      className={cn(
        "flex gap-3 max-w-[85%] sm:max-w-[80%] animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
        isCurrentUser && !isAI ? "ml-auto flex-row-reverse" : "mr-auto",
      )}
    >
      {showAvatar && !isCurrentUser && (
        <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-background shadow-sm">
          <AvatarImage src={message.senderAvatar || "/placeholder.svg"} />
          <AvatarFallback className={cn("text-xs", isAI ? "bg-accent text-accent-foreground" : "")}>
            {isAI ? (
              <Bot className="h-4 w-4" />
            ) : (
              message.senderName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
            )}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn("flex flex-col gap-1", isCurrentUser && !isAI ? "items-end" : "items-start")}>
        {showAvatar && (
          <div
            className={cn(
              "flex items-center gap-2 text-xs text-muted-foreground px-1",
              isCurrentUser && !isAI ? "flex-row-reverse" : "",
            )}
          >
            <span className={cn("flex items-center gap-1 font-medium", isAI ? "text-accent-foreground" : "")}>
              {isAI && <Bot className="h-3 w-3" />}
              {isCurrentUser && !isAI ? "You" : message.senderName}
            </span>
            <span>{message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        )}

        <div
          className={cn(
            "rounded-2xl px-4 py-2 max-w-full break-words shadow-sm transition-all hover:shadow-md",
            isCurrentUser && !isAI
              ? "bg-primary text-primary-foreground rounded-br-md"
              : isAI
                ? "bg-accent text-accent-foreground border border-accent/20 shadow-md rounded-bl-md"
                : "bg-card text-card-foreground border rounded-bl-md",
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          
          {isEncrypted && (
            <button 
              onClick={() => setShowEncryptionIndicator(!showEncryptionIndicator)}
              className="text-xs opacity-70 mt-1 flex items-center gap-1"
            >
              <Lock className="h-3 w-3" />
              {showEncryptionIndicator ? "Encrypted message" : "🔒"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}