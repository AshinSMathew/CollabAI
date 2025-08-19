import { collection, addDoc, query, where, orderBy, onSnapshot, limit, type Unsubscribe } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import type { Message, CreateMessageData } from "@/types/message"

export const messageService = {
  // Send a new message
  async sendMessage(data: CreateMessageData): Promise<Message> {
    const messageData = {
      ...data,
      type: data.type || "text",
      timestamp: new Date(),
    }

    const docRef = await addDoc(collection(db, "messages"), messageData)
    return { id: docRef.id, ...messageData }
  },

  // Upload file and send file message
  async sendFileMessage(
    roomId: string,
    senderId: string,
    senderName: string,
    file: File,
    senderAvatar?: string,
  ): Promise<Message> {
    // Upload file to Firebase Storage
    const fileRef = ref(storage, `chat-files/${roomId}/${Date.now()}_${file.name}`)
    const snapshot = await uploadBytes(fileRef, file)
    const fileUrl = await getDownloadURL(snapshot.ref)

    // Send file message
    return this.sendMessage({
      roomId,
      senderId,
      senderName,
      senderAvatar,
      content: `Shared a file: ${file.name}`,
      type: "file",
      fileUrl,
      fileName: file.name,
      fileType: file.type,
    })
  },

  // Subscribe to messages in a room
  subscribeToMessages(roomId: string, callback: (messages: Message[]) => void): Unsubscribe {
    const q = query(collection(db, "messages"), where("roomId", "==", roomId), orderBy("timestamp", "asc"), limit(100))

    return onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      })) as Message[]
      callback(messages)
    })
  },
}
