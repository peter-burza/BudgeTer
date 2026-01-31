import { User } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { create } from "zustand"
import { db } from "../../firebase"
import { BalanceLedger } from "@/lib/types"

interface AppCurrentBalance {
  currentBalance: number
  setCurrentBalance: (newCurrentBalance: number) => void
  balanceLedger: BalanceLedger
  setBalanceLedger: (newLedger: BalanceLedger) => void
  updateLedger: (currency: string, amount: number) => void
  updateCurrentBalance: (amount: number) => void
  fetchCurrentBalance: (currentUser: User | null) => Promise<void>
  hasFetchedCurrentBalance: boolean
  setHasFetchedCurrentBalance: (val: boolean) => void
  clearCurrentBalance: () => void
}

export const useCurrentBalance = create<AppCurrentBalance>((set, get) => ({
  currentBalance: 0,
  setCurrentBalance: (newCurrentBalance) => set({ currentBalance: newCurrentBalance }),
  updateCurrentBalance: (amount) => set((state) => ({ currentBalance: state.currentBalance + amount })),
  clearCurrentBalance: () => set({ currentBalance: 0 }),

  balanceLedger: {},
  setBalanceLedger: (newLedger) => set({ balanceLedger: newLedger }),
  updateLedger: (currency, amount) => set((state) => ({
    balanceLedger: {
      ...state.balanceLedger,
      [currency]: (state.balanceLedger[currency] || 0) + amount
    }
  })),

  hasFetchedCurrentBalance: false,
  setHasFetchedCurrentBalance: (val) => set({ hasFetchedCurrentBalance: val }),

  fetchCurrentBalance: async (currentUser: User | null) => {
    const { setCurrentBalance, setBalanceLedger, setHasFetchedCurrentBalance, hasFetchedCurrentBalance } = get()

    if (!currentUser || hasFetchedCurrentBalance) return
    // first check if we already have any currentBalance set
    try {
      const userDocRef = doc(db, "users", currentUser.uid)
      const data = (await getDoc(userDocRef)).data()
      const userCurrentBalance = data?.currentBalance
      const userBalanceLedger = data?.balanceLedger
      // console.log("User current balance:", userCurrentBalance)

      if (userCurrentBalance || userCurrentBalance === 0) {
        // User already have currentBalance — return it
        // console.log("Current balance found:", userCurrentBalance)
        set({
          currentBalance: userCurrentBalance,
          balanceLedger: userBalanceLedger || {},
          hasFetchedCurrentBalance: true
        })
      } else {
        // User doesn't have any currentBalance — save it
        await setDoc(userDocRef, {
          currentBalance: 0,
          balanceLedger: {}
        }, { merge: true })

        // console.log("New current balance saved - 0")
        set({
          currentBalance: 0,
          balanceLedger: {},
          hasFetchedCurrentBalance: true
        })
      }
    } catch (error: unknown) {
      if (error instanceof Error) { } // console.log(error.message)
    }
  }
}))
