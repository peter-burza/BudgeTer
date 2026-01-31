import { create } from "zustand"

interface AppStoreProps {
  screenWidth: number
  setScreenWidth: (newScreenWidth: number) => void
}

export const useAppStore = create<AppStoreProps>((set, get) => ({
  screenWidth: 0,
  setScreenWidth: (newScreenWidth) => set({ screenWidth: newScreenWidth }),
}))
