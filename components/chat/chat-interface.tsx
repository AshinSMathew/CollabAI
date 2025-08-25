"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { MessageBubble } from "./message-bubble"
import { MessageInput } from "./message-input"
import { ParticipantList } from "./participant-list"
import { TypingIndicator } from "./typing-indicator"
import { ArrowLeft, Copy, Check, Users, Settings, Lock, Unlock } from "lucide-react"
import { messageService } from "@/lib/message-service"
import { encryptionService } from "@/lib/encryption-service"
import { keyService } from "@/lib/key-service"
import { useAuthContext } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import type { Room } from "@/types/room"
import type { Message } from "@/types/message"
import { cn } from "@/lib/utils"

interface ChatInterfaceProps {
  room: Room
  onLeaveRoom: () => void
}

export function ChatInterface({ room, onLeaveRoom }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [copied, setCopied] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [isAITyping, setIsAITyping] = useState(false)
  const [isEncryptionEnabled, setIsEncryptionEnabled] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuthContext()
  const { toast } = useToast()
  const isMobile = useMobile()

  useEffect(() => {
    const initializeEncryption = async () => {
      if (!user) return

      // Try to get existing key
      let key = await keyService.getRoomKey(room.id, user.uid)
      
      if (!key) {
        // Generate new key if none exists
        key = encryptionService.generateKey()
        encryptionService.setRoomKey(room.id, key)
        
        // Store the key for future use
        await keyService.storeRoomKey(room.id, key, user.uid)
        setIsEncryptionEnabled(true)
        toast({
          title: "Encryption enabled",
          description: "Messages in this room are now encrypted.",
        })
      } else {
        encryptionService.setRoomKey(room.id, key)
        setIsEncryptionEnabled(true)
      }
    }

    initializeEncryption()

    return () => {
      encryptionService.removeRoomKey(room.id)
    }
  }, [room.id, user, toast])

  useEffect(() => {
    const unsubscribe = messageService.subscribeToMessages(room.id, (newMessages) => {
      setMessages(newMessages)
    })

    return () => unsubscribe()
  }, [room.id])

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isAITyping])

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

  const handleMessageSent = () => {
    // Messages will be automatically updated via the subscription
  }

  const handleAITyping = (typing: boolean) => {
    setIsAITyping(typing)
  }

  const groupMessages = (messages: Message[]) => {
    const grouped: (Message & { showAvatar: boolean })[] = []

    messages.forEach((message, index) => {
      const prevMessage = messages[index - 1]
      const showAvatar =
        !prevMessage ||
        prevMessage.senderId !== message.senderId ||
        message.timestamp.getTime() - prevMessage.timestamp.getTime() > 5 * 60 * 1000 // 5 minutes

      grouped.push({ ...message, showAvatar })
    })

    return grouped
  }

  const groupedMessages = groupMessages(messages)

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Button variant="ghost" size="icon" onClick={onLeaveRoom} className="flex-shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="font-semibold truncate">{room.name}</h1>
            <p className="text-sm text-muted-foreground">Room: {room.code}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {isEncryptionEnabled ? (
              <Lock className="h-3 w-3 text-green-500" />
            ) : (
              <Unlock className="h-3 w-3 text-amber-500" />
            )}
            <span>{isEncryptionEnabled ? "Encrypted" : "Unencrypted"}</span>
          </div>
          
          {isMobile && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowParticipants(!showParticipants)}
              className={cn(showParticipants && "bg-accent")}
            >
              <Users className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={copyRoomCode} className="hidden sm:flex bg-transparent">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="ml-2">{copied ? "Copied!" : "Share"}</span>
          </Button>
          <Button variant="outline" size="icon" onClick={copyRoomCode} className="sm:hidden bg-transparent">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            {groupedMessages.length === 0 ? (
              <div className="text-center text-muted-foreground py-12 animate-in fade-in-0 duration-500">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 mx-auto bg-accent/10 rounded-full flex items-center justify-center">
                    <Settings className="h-8 w-8 text-accent" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">Welcome to {room.name}!</p>
                    <p className="text-sm mt-2">Start the conversation or try typing "@ai" to get help from CollabAI</p>
                    {isEncryptionEnabled && (
                      <p className="text-xs mt-1 text-green-500 flex items-center justify-center gap-1">
                        <Lock className="h-3 w-3" /> Messages are encrypted
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {groupedMessages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isCurrentUser={message.senderId === user?.uid}
                    showAvatar={message.showAvatar}
                  />
                ))}
                {isAITyping && (
                  <TypingIndicator senderName="CollabAI" senderAvatar="/ai-robot-assistant.png" isAI={true} />
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          <MessageInput
            roomId={room.id}
            roomName={room.name}
            recentMessages={messages}
            onMessageSent={handleMessageSent}
            onAITyping={handleAITyping}
          />
        </div>

        {/* Sidebar - Desktop */}
        {!isMobile && (
          <div className="border-l p-4 bg-card/30">
            <ParticipantList room={room} />
          </div>
        )}

        {/* Sidebar - Mobile Overlay */}
        {isMobile && showParticipants && (
          <>
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm z-20"
              onClick={() => setShowParticipants(false)}
            />
            <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-card border-l p-4 z-30 animate-in slide-in-from-right duration-300">
              <ParticipantList room={room} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}