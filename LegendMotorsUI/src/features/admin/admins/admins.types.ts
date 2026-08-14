export type Admin = {
  id: number
  username: string
  email: string
  created_at: string
}

export type AdminPayload = {
  username: string
  email: string
  password: string
}
