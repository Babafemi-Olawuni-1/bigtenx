import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Use sessionStorage so the user is logged out when the browser/tab is closed
const useStore = create(
  persist(
    (set) => ({
      user: null,
      darkMode: false,
      activeTab: 'home',

      setUser: (user) => set({ user }),
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      })),
      setDarkMode: (darkMode) => set({ darkMode }),
      setActiveTab: (activeTab) => set({ activeTab }),
      logout: () => set({ user: null, activeTab: 'home' }),
    }),
    {
      name: 'bigtenx-session',
      // sessionStorage clears automatically when the browser/tab is closed
      storage: createJSONStorage(() => sessionStorage),
      // Only persist darkMode preference across sessions via a separate key
      partialize: (state) => ({
        user: state.user,
        darkMode: state.darkMode,
        activeTab: state.activeTab,
      }),
    }
  )
)

export default useStore
