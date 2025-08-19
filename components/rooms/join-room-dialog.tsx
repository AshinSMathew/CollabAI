"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogIn, Loader2 } from "lucide-react"
import { roomService } from "@/lib/room-service"
import { useAuthContext } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"

interface JoinRoomDialogProps {
  onRoomJoined?: (room: any) => void
}

export function JoinRoomDialog({ onRoomJoined }: JoinRoomDialogProps) {
  const [open, setOpen] = useState(false)
  const [roomCode, setRoomCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuthContext()
  const { toast } = useToast()

  const handleJoinRoom = async () => {
    if (!user || !roomCode.trim()) return

    setIsLoading(true)
    try {
      const room = await roomService.joinRoomByCode(roomCode.trim(), user.uid)

      if (!room) {
        toast({
          title: "Room not found",
          description: "Please check the room code and try again.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Joined room successfully!",
        description: `Welcome to ${room.name}`,
      })

      setRoomCode("")
      setOpen(false)
      onRoomJoined?.(room)
    } catch (error) {
      console.error("Error joining room:", error)
      toast({
        title: "Error",
        description: "Failed to join room. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full bg-transparent">
          <LogIn className="mr-2 h-4 w-4" />
          Join Room
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join Room</DialogTitle>
          <DialogDescription>Enter a room code to join an existing collaboration room.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="room-code" className="text-right">
              Room Code
            </Label>
            <Input
              id="room-code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="col-span-3"
              placeholder="Enter 6-character code..."
              maxLength={6}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleJoinRoom} disabled={!roomCode.trim() || isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
            Join Room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
