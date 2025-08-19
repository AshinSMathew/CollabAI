"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Users, Copy, Check } from "lucide-react"
import type { Room } from "@/types/room"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface RoomCardProps {
  room: Room
  onEnterRoom?: (room: Room) => void
}

export function RoomCard({ room, onEnterRoom }: RoomCardProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(room.code)
      setCopied(true)
      toast({
        title: "Room code copied!",
        description: "Share this code with others to invite them.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the room code manually.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{room.name}</CardTitle>
            <CardDescription>Created {room.createdAt.toLocaleDateString()}</CardDescription>
          </div>
          <Badge variant="secondary" className="font-mono">
            {room.code}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {room.participants.length}
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              Active
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyRoomCode}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button size="sm" onClick={() => onEnterRoom?.(room)}>
              Enter Room
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
