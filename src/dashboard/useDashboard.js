import useStore from '../store/useStore'

export function useDashboard() {
  const {
    user, setUser, updateUser,
    darkMode, setDarkMode,
    activeTab, setActiveTab,
    logout,
  } = useStore()

  return {
    user,
    setUser,
    updateUser,
    darkMode,
    setDarkMode,
    activeTab,
    setActiveTab,
    logout,
  }
}
