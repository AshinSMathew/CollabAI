import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  type Unsubscribe,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Room, CreateRoomData } from "@/types/room"
import { encryptionService } from './encryption-service'
import { keyService } from './key-service'

// Generate a random 6-character room code
function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export const roomService = {
  async createRoom(data: CreateRoomData): Promise<Room> {
    const roomCode = generateRoomCode()
    const roomData = {
      name: data.name,
      code: roomCode,
      createdBy: data.createdBy,
      createdAt: new Date(),
      participants: [data.createdBy],
      isActive: true,
    }

    const docRef = await addDoc(collection(db, "rooms"), roomData)
    const key = encryptionService.generateKey()
    encryptionService.setRoomKey(docRef.id, key)
    await keyService.storeRoomKey(docRef.id, key, data.createdBy)
    return { id: docRef.id, ...roomData }
  },

  // Get rooms created by a specific user
  async getUserCreatedRooms(userId: string): Promise<Room[]> {
    const q = query(
      collection(db, "rooms"),
      where("createdBy", "==", userId),
      where("isActive", "==", true),
      orderBy("createdAt", "desc"),
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    })) as Room[]
  },

  // Join a room by code
  async joinRoomByCode(roomCode: string, userId: string): Promise<Room | null> {
    const q = query(collection(db, "rooms"), where("code", "==", roomCode.toUpperCase()), where("isActive", "==", true))

    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) {
      return null
    }

    const roomDoc = querySnapshot.docs[0]
    const roomData = roomDoc.data()

    // Add user to participants if not already in the room
    if (!roomData.participants.includes(userId)) {
      await updateDoc(doc(db, "rooms", roomDoc.id), {
        participants: arrayUnion(userId),
      })
    }

    return {
      id: roomDoc.id,
      ...roomData,
      createdAt: roomData.createdAt.toDate(),
    } as Room
  },

  // Subscribe to user's created rooms
  subscribeToUserRooms(userId: string, callback: (rooms: Room[]) => void): Unsubscribe {
    const q = query(
      collection(db, "rooms"),
      where("createdBy", "==", userId),
      where("isActive", "==", true),
      orderBy("createdAt", "desc"),
    )

    return onSnapshot(q, (querySnapshot) => {
      const rooms = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      })) as Room[]
      callback(rooms)
    })
  },

  // Leave a room
  async leaveRoom(roomId: string, userId: string): Promise<void> {
    await updateDoc(doc(db, "rooms", roomId), {
      participants: arrayRemove(userId),
    })
  },
}
