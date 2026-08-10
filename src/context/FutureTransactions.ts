import { Transaction } from "@/lib/interfaces"
import { User } from "firebase/auth"
import { collection, getDocs } from "firebase/firestore"
import { create } from "zustand"
import { db } from "../../firebase"

interface FutureTransactionsStoreProps {
  futureTransactions: Transaction[]
  setFutureTransactions: (newFutureTransactions: Transaction[]) => void
  fetchFutureTransactions: (currentUser: User | null) => Promise<void>
  addFutureTransaction: (tx: Transaction) => void
  deleteFutureTransaction: (id: string) => void
  hasFetchedFuture: boolean
}

export const useFutureTransactions = create<FutureTransactionsStoreProps>((set, get) => ({
  futureTransactions: [],

  setFutureTransactions: (newFutureTransactions) =>
    set({ futureTransactions: newFutureTransactions }),

  fetchFutureTransactions: async (currentUser: User | null) => {
    if (!currentUser) return

    try {
      const futureTransactionsRef = collection(db, 'users', currentUser.uid, 'futureTransactions')
      const snapshot = await getDocs(futureTransactionsRef)
      const fetchedFutureTransactions = snapshot.docs.map((doc) => {
        const tr = doc.data()
        return {
          id: tr.id,
          origAmount: tr.origAmount,
          baseAmount: tr.baseAmount,
          currency: tr.currency,
          signature: tr.signature,
          type: tr.type,
          date: tr.date,
          category: tr.category,
          description: tr.description || '',
          exchangeRate: tr.exchangeRate,
          hasTransactionCompleted: tr.hasTransactionCompleted ?? true
        }
      })
      get().setFutureTransactions(fetchedFutureTransactions)
      set({ hasFetchedFuture: true })
      // console.log('Future transaction history fetched')
    } catch (error: unknown) {
      if (error instanceof Error) { } // console.log(error.message)
      else { } // console.log(error)
    }
  },

  addFutureTransaction: (tx) =>
    set((state) => ({
      futureTransactions: [...state.futureTransactions, tx],
    })),

  deleteFutureTransaction: (id) =>
    set((state) => ({
      futureTransactions: state.futureTransactions.filter(
        (tx) => tx.id !== id
      ),
    })),
  hasFetchedFuture: false,
}))
