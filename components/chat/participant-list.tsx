"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ChevronDown, ChevronUp } from "lucide-react"
import { doc, onSnapshot, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Room } from "@/types/room"

interface ParticipantListProps {
  room: Room
}

interface UserProfile {
  uid: string
  displayName: string
  photoURL?: string
}

interface Message {
  senderId: string
  senderName: string
  senderAvatar?: string
  timestamp: any
}

export function ParticipantList({ room }: ParticipantListProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [participants, setParticipants] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchParticipantDetails = async (participantIds: string[]) => {
      
      if (participantIds.length === 0) {
        setParticipants([])
        setIsLoading(false)
        return
      }

      try {
        const messagesRef = collection(db, "messages")
        const participantProfiles: UserProfile[] = []
        const processedIds = new Set<string>()

        for (const uid of participantIds) {
          if (processedIds.has(uid)) continue;
          
          try {
            const q = query(
              messagesRef, 
              where("roomId", "==", room.id),
              where("senderId", "==", uid),
              orderBy("timestamp", "desc"),
              limit(1)
            )
            
            const querySnapshot = await getDocs(q)
            
            if (!querySnapshot.empty) {
              const messageDoc = querySnapshot.docs[0]
              const messageData = messageDoc.data() as Message
              
              participantProfiles.push({
                uid: messageData.senderId,
                displayName: messageData.senderName || `User ${uid.slice(-4)}`,
                photoURL: messageData.senderAvatar,
              })
            } else {
              // If no messages found, create a basic profile
              participantProfiles.push({
                uid,
                displayName: `User ${uid.slice(-4)}`,
              })
            }
            
            processedIds.add(uid)
          } catch (error) {
            console.error(`Error fetching details for user ${uid}:`, error)
            // Create a basic profile as fallback
            participantProfiles.push({
              uid,
              displayName: `User ${uid.slice(-4)}`,
            })
          }
        }
        setParticipants(participantProfiles)
      } catch (error) {
        console.error("Error fetching participant details:", error)
        const fallbackParticipants = participantIds.map(uid => ({
          uid,
          displayName: `User ${uid.slice(-4)}`,
          email: `user${uid.slice(-4)}@example.com`,
        }))
        console.log("Using fallback participants:", fallbackParticipants)
        setParticipants(fallbackParticipants)
      } finally {
        setIsLoading(false)
      }
    }

    const unsubscribe = onSnapshot(
      doc(db, "rooms", room.id), 
      (doc) => {
        if (doc.exists()) {
          const roomData = doc.data()
          const participantIds = roomData.participants || []
          fetchParticipantDetails(participantIds)
        } else {
          setIsLoading(false)
        }
      }, 
      (error) => {
        console.error("Error listening to room:", error)
        setIsLoading(false)
      }
    )

    return () => {
      unsubscribe()
    }
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
          {isLoading ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Loading participants...</p>
            </div>
          ) : participants.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No participants in this room</p>
            </div>
          ) : (
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}