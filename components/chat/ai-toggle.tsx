"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bot, BotOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface AIToggleProps {
  isEnabled: boolean
  onToggle: (enabled: boolean) => void
  className?: string
}

export function AIToggle({ isEnabled, onToggle, className }: AIToggleProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant={isEnabled ? "default" : "outline"}
        size="sm"
        onClick={() => onToggle(!isEnabled)}
        className={cn("transition-all", isEnabled ? "bg-accent text-accent-foreground hover:bg-accent/90" : "")}
      >
        {isEnabled ? <Bot className="h-4 w-4 mr-1" /> : <BotOff className="h-4 w-4 mr-1" />}
        AI Assistant
      </Button>
      {isEnabled && (
        <Badge variant="secondary" className="text-xs">
          Active
        </Badge>
      )}
    </div>
  )
}
