import CryptoJS from 'crypto-js'

export interface EncryptionKey {
  key: string
  iv: string
}

class EncryptionService {
  private roomKeys = new Map<string, EncryptionKey>()

  generateKey(): EncryptionKey {
    const key = CryptoJS.lib.WordArray.random(256 / 8).toString(CryptoJS.enc.Hex)
    const iv = CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Hex)
    return { key, iv }
  }

  setRoomKey(roomId: string, key: EncryptionKey) {
    this.roomKeys.set(roomId, key)
  }

  getRoomKey(roomId: string): EncryptionKey | null {
    return this.roomKeys.get(roomId) || null
  }

  removeRoomKey(roomId: string) {
    this.roomKeys.delete(roomId)
  }

  encrypt(text: string, key: EncryptionKey): string {
    const encrypted = CryptoJS.AES.encrypt(
      text,
      CryptoJS.enc.Hex.parse(key.key),
      { 
        iv: CryptoJS.enc.Hex.parse(key.iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    )
    return encrypted.toString()
  }

  decrypt(encryptedText: string, key: EncryptionKey): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(
        encryptedText,
        CryptoJS.enc.Hex.parse(key.key),
        { 
          iv: CryptoJS.enc.Hex.parse(key.iv),
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      )
      return decrypted.toString(CryptoJS.enc.Utf8)
    } catch (error) {
      console.error('Decryption error:', error)
      return '[Unable to decrypt message]'
    }
  }

  isLikelyEncrypted(text: string): boolean {
    return text.length % 4 === 0 && /^[A-Za-z0-9+/]*={0,2}$/.test(text)
  }
}

export const encryptionService = new EncryptionService()