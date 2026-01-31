import { ExpectingTransaction } from "@/lib/interfaces"
import { User } from "firebase/auth"
import { collection, getDocs } from "firebase/firestore"
import { create } from "zustand"
import { db } from "../../firebase"

interface ExpTransactionsStoreProps {
  expTransactions: ExpectingTransaction[]
  signatures: string[]
  setExpTransactions: (
    updater: ExpectingTransaction[] | ((prev: ExpectingTransaction[]) => ExpectingTransaction[])
  ) => void
  isDuplicate: (id: string) => boolean
  fetchExpTransactions: (currentUser: User | null) => Promise<void>
  hasFetchedExp: boolean
}

export const useExpTransactionsStore = create<ExpTransactionsStoreProps>((set, get) => ({
  expTransactions: [],

  signatures: [],

  setExpTransactions: (updater) =>
    set((state) => {
      const updated =
        typeof updater === "function" ? updater(state.expTransactions) : updater

      return {
        expTransactions: updated,
        signatures: updated.map((tx) => tx.signature),
      }
    }),

  isDuplicate: (signature: string) => {
    return get().signatures.includes(signature)
  },

  fetchExpTransactions: async (currentUser: User | null) => { // this fetches all expecting transactions
    if (!currentUser) return
    try {
      const transactionsRef = collection(db, 'users', currentUser.uid, 'expTransactions')
      const snapshot = await getDocs(transactionsRef)
      const fetchedTransactions = snapshot.docs.map((doc) => {
        const tr = doc.data()
        return {
          id: tr.id,
          origAmount: tr.origAmount,
          baseAmount: tr.baseAmount,
          currency: tr.currency,
          signature: tr.signature,
          type: tr.type,
          payDay: tr.payDay,
          startDate: tr.startDate,
          category: tr.category,
          description: tr.description || '',
          exchangeRate: tr.exchangeRate,
          processedMonths: tr.processedMonths
        }
      })
      get().setExpTransactions(fetchedTransactions)
      set({ hasFetchedExp: true })
      // console.log('Expecting Transactions fetched')
    } catch (error: unknown) {
      if (error instanceof Error) { } // console.log(error.message)
      else { } // console.log(error)
    }
  },
  hasFetchedExp: false,
}))
