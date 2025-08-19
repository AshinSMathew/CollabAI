"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LoadingDots } from "@/components/ui/loading-dots"
import { Bot } from "lucide-react"

interface TypingIndicatorProps {
  senderName: string
  senderAvatar?: string
  isAI?: boolean
}

export function TypingIndicator({ senderName, senderAvatar, isAI }: TypingIndicatorProps) {
  return (
    <div className="flex gap-3 max-w-[80%] mr-auto animate-in fade-in-0 slide-in-from-left-2 duration-300">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={senderAvatar || "/placeholder.svg"} />
        <AvatarFallback className={isAI ? "bg-accent text-accent-foreground" : ""}>
          {isAI ? (
            <Bot className="h-4 w-4" />
          ) : (
            senderName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
          )}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            {isAI && <Bot className="h-3 w-3" />}
            {senderName}
          </span>
          <span>is typing...</span>
        </div>

        <div className="bg-card border rounded-lg px-3 py-2 shadow-sm">
          <LoadingDots className="text-muted-foreground" />
        </div>
      </div>
    </div>
  )
}
