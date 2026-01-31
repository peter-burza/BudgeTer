'use client'

import { Transaction } from "@/lib/interfaces"
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useMemo, useState } from "react"
import { processFutureTransactions, saveTransaction } from "@/lib"
import { User } from "firebase/auth"
import { collection, doc, getDocs, increment, runTransaction } from "firebase/firestore"
import { db } from "../../firebase"
import { TrType } from "@/lib/enums"


import { useCurrentBalance } from "./CurrentBalance"
import { useFutureTransactions } from "./FutureTransactions"


type TransactionsContextType = {
  transactions: Transaction[]
  setTransactions: Dispatch<SetStateAction<Transaction[]>>
  clearTransactions: () => void
  isDuplicate: (id: string) => boolean
  saveUnloggedTransactions: (userId: string, updateCurrentBalance: (value: number) => void, updateLedger: (currency: string, amount: number) => void) => Promise<void>
  fetchTransactions: (currentUser: User | null) => Promise<void>
  deleteTransaction: (deleteTrId: string | undefined, isLoading: boolean, currentUser: User | null, setIsLoading: Dispatch<SetStateAction<boolean>>, updateCurrentBalance: (value: number) => void, updateLedger?: (currency: string, amount: number) => void) => Promise<void>
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined)


export function useTransactions(): TransactionsContextType {
  const context = useContext(TransactionsContext)
  if (!context) {
    throw new Error('useTransactions must be used within an TransactionsProvider')
  }
  return context
}


export default function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const deleteFutureTransaction = useFutureTransactions((state) => state.deleteFutureTransaction)

  const trSignatures = useMemo(() => {
    return new Set<string>(transactions.map(tx => tx.signature))
  }, [transactions])

  const clearTransactions = () => { setTransactions([]) }
  const isDuplicate = (signature: string) => {
    return trSignatures.has(signature)
  }

  async function saveUnloggedTransactions(userId: string, updateCurrentBalance: (value: number) => void, updateLedger: (currency: string, amount: number) => void) {
    const addFutureTransaction = useFutureTransactions.getState().addFutureTransaction
    // If there is a record of any transactions before a registration of an user.
    if (userId && transactions.length > 0) {
      const promises = transactions.map((t) => {
        return saveTransaction(t, userId, updateCurrentBalance, undefined, undefined, updateLedger, addFutureTransaction)
      })
      await Promise.all(promises)
      setTransactions([]) // Clear local unlogged transactions after saving
    }
  }

  async function fetchTransactions(currentUser: User | null) { // this fetches all transactions
    if (!currentUser) return

    // Reconcile future transactions
    const { updateCurrentBalance, updateLedger } = useCurrentBalance.getState()
    await processFutureTransactions(currentUser.uid, updateCurrentBalance, updateLedger)

    try {
      const transactionsRef = collection(db, 'users', currentUser.uid, 'transactions')
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
          date: tr.date,
          category: tr.category,
          description: tr.description || '',
          exchangeRate: tr.exchangeRate,
          hasTransactionCompleted: tr.hasTransactionCompleted ?? true
        }
      })
      setTransactions(fetchedTransactions)
      // console.log('Transaction history fetched')
    } catch (error: unknown) {
      if (error instanceof Error) { } // console.log(error.message)
      else { } // console.log(error)
    }
  }

  async function deleteTransaction(deleteTrId: string | undefined, isLoading: boolean, currentUser: User | null, setIsLoading: Dispatch<SetStateAction<boolean>>, updateCurrentBalance: (value: number) => void, updateLedger?: (currency: string, amount: number) => void) {
    // Guard closes
    if (isLoading || deleteTrId === undefined) return
    if (!currentUser?.uid) {
      throw new Error("User is not authenticated")
    }
    let updatedBalance: number = 0


    try {
      setIsLoading(true)

      const deletedTr = await runTransaction(db, async (transaction) => {

        const userRef = doc(db, "users", currentUser.uid)
        const trRef = doc(db, "users", currentUser.uid, "transactions", deleteTrId)
        const futureTrRef = doc(db, "users", currentUser.uid, "futureTransactions", deleteTrId)

        // Guard closes
        const trSnap = await transaction.get(trRef)
        if (!trSnap.exists()) {
          throw new Error("Transaction does not exist")
        }
        const userSnap = await transaction.get(userRef)
        if (!userSnap.exists()) {
          throw new Error("User does not exist")
        }
        if (typeof userSnap.data().currentBalance !== "number") {
          throw new Error("currentBalance is not a initialized")
        }

        // service data
        const tr = trSnap.data() as Transaction
        const currBalance = userSnap.data().currentBalance
        const isIncome = tr.type === TrType.Income
        updatedBalance = isIncome ? currBalance - tr.baseAmount : currBalance + tr.baseAmount


        transaction.delete(trRef)

        // guard close - if tr is not completed (is from future)
        if (!tr.hasTransactionCompleted) {
          transaction.delete(futureTrRef)
          return tr
        }

        // atomic balance update
        const updates: Record<string, number | ReturnType<typeof increment>> = {
          currentBalance: updatedBalance
        }
        if (userSnap.data().balanceLedger) {
          updates[`balanceLedger.${tr.currency.code}`] = isIncome ? increment(-tr.origAmount) : increment(tr.origAmount)
        }
        transaction.update(userRef, updates)
        return tr
      })

      // update local state
      const updatedTransactions = transactions.filter(t => (t.id !== deleteTrId))
      setTransactions(updatedTransactions)
      // console.log('Transaction (id: ' + deleteTrId + ') deleted successfully')

      // guard close - if tr is not completed (is from future)
      if (deletedTr && !deletedTr.hasTransactionCompleted) {
        deleteFutureTransaction(deleteTrId)
        return
      }

      if (deletedTr) {
        const isIncome = deletedTr.type === TrType.Income
        const balanceChange = isIncome ? -deletedTr.baseAmount : deletedTr.baseAmount
        updateCurrentBalance(balanceChange)

        updateLedger?.(deletedTr.currency.code, isIncome ? -deletedTr.origAmount : deletedTr.origAmount)
      }
    } catch (error: unknown) {
      if (error instanceof Error) { } // console.log(error.message)
      else { } // console.log(error)
    } finally {
      setIsLoading(false)
    }
  }


  const value: TransactionsContextType = {
    transactions,
    setTransactions,
    clearTransactions,
    isDuplicate,
    saveUnloggedTransactions,
    fetchTransactions,
    deleteTransaction
  }

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  )
}