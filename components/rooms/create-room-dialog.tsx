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
import { Plus, Loader2 } from "lucide-react"
import { roomService } from "@/lib/room-service"
import { useAuthContext } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"

interface CreateRoomDialogProps {
  onRoomCreated?: (room: any) => void
}

export function CreateRoomDialog({ onRoomCreated }: CreateRoomDialogProps) {
  const [open, setOpen] = useState(false)
  const [roomName, setRoomName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuthContext()
  const { toast } = useToast()

  const handleCreateRoom = async () => {
    if (!user || !roomName.trim()) return

    setIsLoading(true)
    try {
      const room = await roomService.createRoom({
        name: roomName.trim(),
        createdBy: user.uid,
      })

      toast({
        title: "Room created successfully!",
        description: `Room code: ${room.code}`,
      })

      setRoomName("")
      setOpen(false)
      onRoomCreated?.(room)
    } catch (error) {
      console.error("Error creating room:", error)
      toast({
        title: "Error",
        description: "Failed to create room. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Create New Room
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Room</DialogTitle>
          <DialogDescription>
            Create a new collaboration room. You'll get a room code to share with others.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="room-name" className="text-right">
              Room Name
            </Label>
            <Input
              id="room-name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="col-span-3"
              placeholder="Enter room name..."
              maxLength={50}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreateRoom} disabled={!roomName.trim() || isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Create Room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
