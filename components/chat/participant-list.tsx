"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ChevronDown, ChevronUp } from "lucide-react"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Room } from "@/types/room"

interface ParticipantListProps {
  room: Room
}

interface UserProfile {
  uid: string
  displayName: string
  photoURL?: string
  email: string
}

export function ParticipantList({ room }: ParticipantListProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [participants, setParticipants] = useState<UserProfile[]>([])

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "rooms", room.id), (doc) => {
      if (doc.exists()) {
        const roomData = doc.data()
        // In a real app, you'd fetch user profiles for each participant
        // For now, we'll create mock profiles
        const mockParticipants = roomData.participants.map((uid: string) => ({
          uid,
          displayName: `User ${uid.slice(-4)}`,
          email: `user${uid.slice(-4)}@example.com`,
        }))
        setParticipants(mockParticipants)
      }
    })

    return () => unsubscribe()
  }, [room.id])

  return (
    <Card className="w-64 h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Participants ({participants.length})
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {participants.map((participant) => (
              <div key={participant.uid} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={participant.photoURL || "/placeholder.svg"} />
                  <AvatarFallback className="text-xs">
                    {participant.displayName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{participant.displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{participant.email}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
