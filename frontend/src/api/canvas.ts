import client from './client'

export interface StartSessionResult {
  id: string
  topic: string
  message: string
}

export interface CompleteResult {
  guess: string
}

export async function startSession(nickname: string): Promise<StartSessionResult> {
  const res = await client.post('/canvas/start', { nickname })
  return res.data
}

export async function completeCanvas(sessionId: string, canvasBase64: string): Promise<CompleteResult> {
  const res = await client.post(`/canvas/${sessionId}/complete`, { canvasBase64 })
  return res.data
}
