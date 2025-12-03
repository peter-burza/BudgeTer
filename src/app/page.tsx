'use client'

import Entry from "../components/Entry"
import { useEffect, useState } from "react"
import TransactionHistory from "../components/TransactionHistory"
import { useAuth } from "../context/AuthContext"
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore"
import { db } from "../../firebase"
import { useSettingsStore } from "@/context/SettingsState"
import { useCurrencyStore } from "@/context/CurrencyState"
import { useTransactions } from "@/context/TransactionsContext"
import { areTransactionSetsEqual, processExpTransactions } from "@/lib"
import { useAppStore } from "@/context/AppStore"
import { useExpTransactionsStore } from "@/context/ExpTransactionsStore"
import RegistrationReminder from "@/components/ui/RegistrationReminder"

export default function Dashboard() {
  const { currentUser, firstLogin } = useAuth()
  const { transactions, setTransactions, saveUnloggedTransactions } = useTransactions()
  const { expTransactions, setExpTransactions } = useExpTransactionsStore()
  const screenWidth = useAppStore((state) => state.screenWidth)
  const rates = useCurrencyStore((state) => state.rates)

  const [isLoading, setIsLoading] = useState(false)

  const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency)
  const fetchUserSettings = useSettingsStore((state) => state.fetchUserSettings)
  const fetchRates = useCurrencyStore((state) => state.fetchRates)


  // Delete Transaction
  async function deleteTransaction(deleteTrId: string | undefined) {
    // Guard closes
    if (isLoading || deleteTrId === undefined) return
    if (!currentUser?.uid) {
      throw new Error("User is not authenticated")
    }

    // ask if user is sure to delete this transaction

    // Delete try
    try {
      setIsLoading(true)

      const transactionRef = doc(db, "users", currentUser?.uid, "transactions", deleteTrId)
      await deleteDoc(transactionRef)

      const updatedTransactions = transactions.filter(t => (t.id !== deleteTrId))
      setTransactions(updatedTransactions)
      console.log('Transaction (id: ' + deleteTrId + ') deleted successfully')
    } catch (error: unknown) {
      if (error instanceof Error) console.log(error.message)
      else console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchTransactions() { // this fetches all transactions
    if (!currentUser) return
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
        }
      })
      if (!areTransactionSetsEqual(transactions, fetchedTransactions)) {
        setTransactions(fetchedTransactions)
        console.log('Transaction history fetched')
      }
    } catch (error: unknown) {
      if (error instanceof Error) console.log(error.message)
      else console.log(error)
    }
  }

  async function fetchExpTransactions() { // this fetches all expecting transactions
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
      if (!areTransactionSetsEqual(expTransactions, fetchedTransactions)) {
        // console.log(fetchedTransactions)
        setExpTransactions(fetchedTransactions)
        console.log('Expecting Transactions fetched')
      }
    } catch (error: unknown) {
      if (error instanceof Error) console.log(error.message)
      else console.log(error)
    }
  }


  useEffect(() => {
    if (!currentUser) return

    if (firstLogin) {
      saveUnloggedTransactions(currentUser.uid)
    }

    async function fetchAll() {
      setIsLoading(true)
      try {
        fetchUserSettings(currentUser)
        await fetchTransactions()
        await fetchExpTransactions() // ✅ wait for this to finish

        // ✅ Now run processExpTransactions
        await processExpTransactions(useExpTransactionsStore.getState().expTransactions, currentUser, setTransactions, setIsLoading, rates)
      } catch (error: unknown) {
        if (error instanceof Error) console.log(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAll()
  }, [currentUser])

  // Fetch rates on app startup
  useEffect(() => {
    console.log('fetching rates')

    fetchRates()
  }, [fetchRates])


  return (
    <>
      <Entry
        // saveTransaction={saveTransaction}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
      <TransactionHistory
        transactions={transactions}
        selectedCurrency={selectedCurrency}
        deleteTransaction={deleteTransaction}
        screenWidth={screenWidth}
        isLoading={isLoading}
      />

      {/* Track time to remind unlogged user with some data presaved */}
      <RegistrationReminder
        isUserLoggedIn={!!currentUser}
        transactions={transactions}
      />
    </>
  )
}
