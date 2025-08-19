"use client"

import { useState } from "react"
import { useAuthContext } from "@/components/auth/auth-provider"
import { LoginPage } from "@/components/auth/login-page"
import { RoomDashboard } from "@/components/rooms/room-dashboard"
import { ChatInterface } from "@/components/chat/chat-interface"
import { Loader2 } from "lucide-react"
import type { Room } from "@/types/room"

export default function HomePage() {
  const { user, loading } = useAuthContext()
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null)

  const handleEnterRoom = (room: Room) => {
    setCurrentRoom(room)
  }

  const handleLeaveRoom = () => {
    setCurrentRoom(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  if (currentRoom) {
    return <ChatInterface room={currentRoom} onLeaveRoom={handleLeaveRoom} />
  }

  return <RoomDashboard onEnterRoom={handleEnterRoom} />
}
