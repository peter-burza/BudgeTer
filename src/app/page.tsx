'use client'

import Entry from "../components/Entry"
import { useEffect, useState } from "react"
import BudgetOverview from "../components/BudgetOverview"
import { useAuth } from "../context/AuthContext"
import { useSettingsStore } from "@/context/SettingsState"
import { useCurrencyStore } from "@/context/CurrencyState"
import { useTransactions } from "@/context/TransactionsContext"
import { processExpTransactions } from "@/lib"
import { useExpTransactionsStore } from "@/context/ExpTransactionsStore"
import RegistrationReminder from "@/components/ui/RegistrationReminder"
import CurrentOverview from "@/components/CurrentOverview"
import { useCurrentBalance } from "@/context/CurrentBalance"
import { useFutureTransactions } from "@/context/FutureTransactions"

export default function Dashboard() {
  const { currentUser, firstLogin } = useAuth()
  const updateCurrentBalance = useCurrentBalance(state => state.updateCurrentBalance)
  const updateLedger = useCurrentBalance(state => state.updateLedger)
  const { transactions, setTransactions, saveUnloggedTransactions, fetchTransactions, deleteTransaction } = useTransactions()
  const fetchExpTransactions = useExpTransactionsStore(state => state.fetchExpTransactions)
  const fetchFutureTransactions = useFutureTransactions(state => state.fetchFutureTransactions)
  const rates = useCurrencyStore((state) => state.rates)
  const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency)

  const [isLoading, setIsLoading] = useState(false)

  const fetchUserSettings = useSettingsStore((state) => state.fetchUserSettings)
  const fetchRates = useCurrencyStore((state) => state.fetchRates)

  const fetchCurrentBalance = useCurrentBalance((state) => state.fetchCurrentBalance)


  useEffect(() => {
    if (!currentUser) return
    let isCancelled = false

    async function fetchAll() {
      setIsLoading(true)
      try {
        fetchUserSettings(currentUser)
        // 1. First ensure user balance is fetched/initialized in DB
        await fetchCurrentBalance(currentUser)

        if (isCancelled) return

        // 2. If it's a first login, await saving unlogged transactions to the initialized DB
        if (firstLogin && currentUser) {
          await saveUnloggedTransactions(currentUser.uid, updateCurrentBalance, updateLedger)
        }

        if (isCancelled) return

        // 3. Now it is safe to fetch what's in the DB
        await Promise.all([
          fetchTransactions(currentUser),
          fetchExpTransactions(currentUser),
          fetchFutureTransactions(currentUser)
        ])

        if (isCancelled) return

        // 4. Finally process recurring transactions
        await processExpTransactions(
          useExpTransactionsStore.getState().expTransactions,
          currentUser,
          setTransactions,
          updateCurrentBalance,
          setIsLoading,
          rates,
          updateLedger
        )
      } catch (error: unknown) {
        if (error instanceof Error) { } // console.log(error.message)
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    fetchAll()

    return () => { isCancelled = true }
  }, [currentUser, firstLogin])

  // Fetch rates on app startup
  useEffect(() => {
    fetchRates()
  }, [fetchRates])


  return (
    <>
      <CurrentOverview />
      <Entry
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
      <BudgetOverview
        transactions={transactions}
        selectedCurrency={selectedCurrency}
        deleteTransaction={deleteTransaction}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />

      {/* Track time to remind unlogged user with some data presaved */}
      <RegistrationReminder
        isUserLoggedIn={!!currentUser}
        transactions={transactions}
      />
    </>
  )
}
