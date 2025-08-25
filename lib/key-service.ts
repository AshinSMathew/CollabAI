import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from './firebase'
import { encryptionService, type EncryptionKey } from './encryption-service'

class KeyService {
  async storeRoomKey(roomId: string, key: EncryptionKey, userId: string) {
    await setDoc(doc(db, 'roomKeys', `${roomId}_${userId}`), {
      key: key.key,
      iv: key.iv,
      createdAt: new Date()
    })
  }

  async getRoomKey(roomId: string, userId: string): Promise<EncryptionKey | null> {
    try {
      const docRef = doc(db, 'roomKeys', `${roomId}_${userId}`)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        return { key: data.key, iv: data.iv }
      }
      return null
    } catch (error) {
      console.error('Error getting room key:', error)
      return null
    }
  }
}

export const keyService = new KeyService()