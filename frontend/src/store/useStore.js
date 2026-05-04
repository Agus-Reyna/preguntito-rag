import { create } from 'zustand'

export const useStore = create((set, get) => ({
  // Session
  sessionId: '',

  // Theme
  isDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
  toggleTheme: () => {
    const next = !get().isDark
    set({ isDark: next })
    document.documentElement.classList.toggle('dark', next)
  },

  // Documents
  documents: [],
  addDocument: (doc) => set((s) => ({ documents: [...s.documents, doc] })),
  removeDocument: (id) => set((s) => ({ documents: s.documents.filter((d) => d.id !== id) })),

  // Messages
  messages: [],
  isThinking: false,
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, { ...msg, id: Date.now() }] })),
  setThinking: (v) => set({ isThinking: v }),
  clearMessages: () => set({ messages: [] }),

  // Reset session
  resetSession: () => set({
    sessionId: '',
    documents: [],
    messages: [],
    isThinking: false,
    isUploading: false,
  }),

  // Uploading state
  isUploading: false,
  setUploading: (v) => set({ isUploading: v }),
}))
