import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from './firebase'
import { encryptionService, type EncryptionKey } from './encryption-service'

class KeyService {
  // Store room key in Firebase (shared by all participants)
  async storeRoomKey(roomId: string, key: EncryptionKey): Promise<void> {
    await setDoc(doc(db, 'roomKeys', roomId), {
      key: key.key,
      iv: key.iv,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  // Retrieve room key from Firebase
  async getRoomKey(roomId: string): Promise<EncryptionKey | null> {
    try {
      const docRef = doc(db, 'roomKeys', roomId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        return { 
          key: data.key, 
          iv: data.iv 
        }
      }
      return null
    } catch (error) {
      console.error('Error getting room key:', error)
      return null
    }
  }

  // Listen for room key changes
  listenForRoomKey(roomId: string, callback: (key: EncryptionKey | null) => void) {
    return onSnapshot(doc(db, 'roomKeys', roomId), (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        callback({ key: data.key, iv: data.iv })
      } else {
        callback(null)
      }
    })
  }

  // Check if room has a key
  async hasRoomKey(roomId: string): Promise<boolean> {
    const key = await this.getRoomKey(roomId)
    return key !== null
  }

  // Update room key (for key rotation)
  async updateRoomKey(roomId: string, key: EncryptionKey): Promise<void> {
    await setDoc(doc(db, 'roomKeys', roomId), {
      key: key.key,
      iv: key.iv,
      updatedAt: new Date()
    }, { merge: true })
  }
}

export const keyService = new KeyService()