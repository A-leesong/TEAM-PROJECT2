import { create } from 'zustand'
import type { StrokeData } from '../types'

interface CanvasState {
  sessionId: string | null
  topic: string | null
  strokes: StrokeData[]
  isAiTurn: boolean
  turnCount: number
  aiComment: string | null
  isDone: boolean
  setSession: (id: string, topic: string) => void
  addStroke: (stroke: StrokeData) => void
  setAiTurn: (isAi: boolean) => void
  setAiComment: (comment: string | null) => void
  incrementTurn: () => void
  setDone: (done: boolean) => void
  reset: () => void
}

export const useCanvasStore = create<CanvasState>((set) => ({
  sessionId: null,
  topic: null,
  strokes: [],
  isAiTurn: false,
  turnCount: 0,
  aiComment: null,
  isDone: false,
  setSession: (id, topic) => set({ sessionId: id, topic }),
  addStroke: (stroke) => set((state) => ({ strokes: [...state.strokes, stroke] })),
  setAiTurn: (isAi) => set({ isAiTurn: isAi }),
  setAiComment: (comment) => set({ aiComment: comment }),
  incrementTurn: () => set((state) => ({ turnCount: state.turnCount + 1 })),
  setDone: (done) => set({ isDone: done }),
  reset: () => set({
    sessionId: null,
    topic: null,
    strokes: [],
    isAiTurn: false,
    turnCount: 0,
    aiComment: null,
    isDone: false,
  }),
}))
