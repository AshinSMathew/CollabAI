import { collection, addDoc, query, where, orderBy, onSnapshot, limit, type Unsubscribe } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { encryptionService } from "./encryption-service"
import type { Message, CreateMessageData } from "@/types/message"

export const messageService = {
  // Send a new message
  async sendMessage(data: CreateMessageData): Promise<Message> {
    const key = encryptionService.getRoomKey(data.roomId)
    let content = data.content
    let isEncrypted = false

    // Encrypt the message if we have a key
    if (key) {
      content = encryptionService.encrypt(data.content, key)
      isEncrypted = true
    }

    const messageData = {
      ...data,
      content,
      isEncrypted,
      type: data.type || "text",
      timestamp: new Date(),
    }

    const docRef = await addDoc(collection(db, "messages"), messageData)
    return { id: docRef.id, ...messageData }
  },

  // Subscribe to messages in a room
  subscribeToMessages(roomId: string, callback: (messages: Message[]) => void): Unsubscribe {
    const q = query(collection(db, "messages"), where("roomId", "==", roomId), orderBy("timestamp", "asc"), limit(100))

    return onSnapshot(q, (querySnapshot) => {
      const key = encryptionService.getRoomKey(roomId)
      const messages = querySnapshot.docs.map((doc) => {
        const messageData = doc.data()
        let content = messageData.content
        
        // Decrypt if the message is encrypted and we have the key
        if (messageData.isEncrypted && key) {
          try {
            content = encryptionService.decrypt(messageData.content, key)
          } catch (error) {
            console.error('Error decrypting message:', error)
            content = '[Unable to decrypt message]'
          }
        }
        
        return {
          id: doc.id,
          ...messageData,
          content,
          timestamp: messageData.timestamp.toDate(),
        }
      }) as Message[]
      callback(messages)
    })
  },
}