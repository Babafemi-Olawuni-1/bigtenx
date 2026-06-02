import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const useStore = create(
  persist(
    (set) => ({
      user: null,
      darkMode: false,
      activeTab: 'home',

      setUser: (user) => set({ user }),

      // Guard: skip the set if nothing actually changed
      updateUser: (updates) => set((state) => {
        if (!state.user) return state
        // Check if any value is actually different before creating a new object
        const hasChange = Object.keys(updates).some(
          (k) => state.user[k] !== updates[k]
        )
        if (!hasChange) return state
        return { user: { ...state.user, ...updates } }
      }),

      setDarkMode: (darkMode) => set({ darkMode }),
      setActiveTab: (activeTab) => set({ activeTab }),
      logout: () => set({ user: null, activeTab: 'home' }),
    }),
    {
      name: 'bigtenx-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        darkMode: state.darkMode,
        activeTab: state.activeTab,
      }),
    }
  )
)

export default useStore
