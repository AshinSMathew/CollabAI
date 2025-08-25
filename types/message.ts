export interface Message {
  isEncrypted: boolean
  id: string
  roomId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  type: "text" | "file" | "ai"
  timestamp: Date
  fileUrl?: string
  fileName?: string
  fileType?: string
}

export interface CreateMessageData {
  roomId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  type?: "text" | "file" | "ai"
  fileUrl?: string
  fileName?: string
  fileType?: string
}
