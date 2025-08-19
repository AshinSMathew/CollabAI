"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreateRoomDialog } from "./create-room-dialog"
import { JoinRoomDialog } from "./join-room-dialog"
import { RoomCard } from "./room-card"
import { useAuthContext } from "@/components/auth/auth-provider"
import { roomService } from "@/lib/room-service"
import type { Room } from "@/types/room"
import { Loader2, LogOut, Plus, Users } from "lucide-react"

interface RoomDashboardProps {
  onEnterRoom?: (room: Room) => void
}

export function RoomDashboard({ onEnterRoom }: RoomDashboardProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuthContext()

  useEffect(() => {
    if (!user) return

    const unsubscribe = roomService.subscribeToUserRooms(user.uid, (userRooms) => {
      setRooms(userRooms)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const handleRoomCreated = (room: Room) => {
    // Room will be automatically added via the subscription
  }

  const handleRoomJoined = (room: Room) => {
    // Optionally enter the room immediately after joining
    onEnterRoom?.(room)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading your rooms...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-primary">CollabAI</h1>
            <p className="text-muted-foreground text-lg">Welcome back, {user?.displayName}</p>
          </div>
          <Button variant="outline" onClick={logout} className="self-start sm:self-center bg-transparent">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Create New Room</h3>
                  <p className="text-sm text-muted-foreground">Start a new collaboration space</p>
                </div>
              </div>
              <CreateRoomDialog onRoomCreated={handleRoomCreated} />
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 border-2 hover:border-accent/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">Join Room</h3>
                  <p className="text-sm text-muted-foreground">Enter an existing room with a code</p>
                </div>
              </div>
              <JoinRoomDialog onRoomJoined={handleRoomJoined} />
            </CardContent>
          </Card>
        </div>

        {/* My Rooms */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              My Rooms
            </CardTitle>
            <CardDescription>Rooms you've created and manage</CardDescription>
          </CardHeader>
          <CardContent>
            {rooms.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-muted-foreground mb-4">You haven't created any rooms yet.</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Create your first room to start collaborating with AI and your team.
                  </p>
                  <CreateRoomDialog onRoomCreated={handleRoomCreated} />
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {rooms.map((room, index) => (
                  <div
                    key={room.id}
                    className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <RoomCard room={room} onEnterRoom={onEnterRoom} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
