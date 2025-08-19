export interface Room {
  id: string
  name: string
  code: string
  createdBy: string
  createdAt: Date
  participants: string[]
  isActive: boolean
}

export interface CreateRoomData {
  name: string
  createdBy: string
}
