'use client'

import React, { useEffect, useMemo, useState } from "react"
import TransactionsList, { sortDateNewestFirst } from "./TransactionsList"
import { calculateTotalInCurrency, calculateTotalSimplier, fancyNumber, getMonth, getMonthName, getMonthNumber, getYear, getYearsFromTransactions, roundToTwo } from "@/lib"
import { Transaction } from "@/lib/interfaces"
import { TrType } from '@/lib/enums'
import ExpenseBreakdown from "./ExpenseBreakdown"
import { Currency } from "@/lib/types"
import { useCurrencyStore } from "@/context/CurrencyState"
import Summary from "./Summary"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/ShadcnComponents/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/ShadcnComponents/accordion"
import { useAppStore } from "@/context/AppStore"
import { Dispatch, SetStateAction } from "react"
import { User } from "firebase/auth"
import dayjs from "dayjs"

interface BudgetOverviewProps {
  transactions: Transaction[]
  selectedCurrency: Currency
  deleteTransaction: (deleteTrId: string | undefined, isLoading: boolean, currentUser: User | null, setIsLoading: Dispatch<SetStateAction<boolean>>, updateCurrentBalance: (value: number) => void, updateLedger?: (currency: string, amount: number) => void) => void
  isLoading: boolean
  setIsLoading: Dispatch<SetStateAction<boolean>>
}

const OVERALL = 'overall'

const BudgetOverview: React.FC<BudgetOverviewProps> = ({ transactions, selectedCurrency, deleteTransaction, isLoading, setIsLoading }) => {
  const baseCurrency = useCurrencyStore(state => state.baseCurrency)
  const convertGlobalFunc = useCurrencyStore(state => state.convertGlobalFunc)
  const convert = useCurrencyStore((state) => state.convert)
  const screenWidth = useAppStore((state) => state.screenWidth)

  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [resetSignal, setResetSignal] = useState<number>(0)
  const [totalExpense, setTotalExpense] = useState<number>(0)
  const [incomeFilteredTransactions, setIncomeFilteredTransactions] = useState<Transaction[]>([])
  const [expenseFilteredTransactions, setExpenseFilteredTransactions] = useState<Transaction[]>([])


  // Years list once
  const years = useMemo(() => [OVERALL, ...getYearsFromTransactions(transactions).sort((a, b) => Number(b) - Number(a))], [transactions])

  const dateFilteredTransactions = useMemo(() => {
    if (transactions.length === 0 || selectedMonth == "" || selectedYear == "") return []
    let list = transactions

    // Year
    if (selectedYear !== OVERALL) {
      list = list.filter((t) => getYear(t.date) === selectedYear)
    }

    // Month (selectedMonth is 'overall' or full lowercase month name)
    if (selectedMonth !== OVERALL) {
      const monthNum = getMonthNumber(selectedMonth) // returns '01'..'12'
      list = list.filter((t) => getMonth(t.date) === monthNum)
    }

    return list
  }, [selectedYear, selectedMonth, transactions])


  function triggerReset() {
    setResetSignal(() => resetSignal + 1)
  }

  function convertAmount(amount: number, rate: number) {
    const convertedAmount = roundToTwo(convert(amount, rate))
    return convertedAmount
  }

  function displayAmount(amount: number, rate?: number) {
    const modifiedAmount = rate ? convertAmount(amount, rate) : amount
    const fanciedAmount = fancyNumber(modifiedAmount)
    return fanciedAmount
  }

  // TotalExpence calculation
  useEffect(() => {
    let isCancelled = false

    if (expenseFilteredTransactions.length === 0) {
      setTotalExpense(0)
      return
    }

    calculateTotalInCurrency(
      expenseFilteredTransactions,
      selectedCurrency.code,
      baseCurrency.code,
      convertGlobalFunc
    ).then((total) => {
      if (!isCancelled) {
        setTotalExpense(total)
      }
    })

    return () => {
      isCancelled = true
    }
  }, [expenseFilteredTransactions, selectedCurrency])

  useEffect(() => {
    const income = dateFilteredTransactions.filter(t => t.type === TrType.Income)
    const expense = dateFilteredTransactions.filter(t => t.type === TrType.Expense)

    setIncomeFilteredTransactions(income)
    setExpenseFilteredTransactions(expense)
  }, [dateFilteredTransactions])

  useEffect(() => { // to ensure that when the page is loaded and all data are fetched, the filter will set current month and year
    if (transactions.length === 0) return

    const month = dayjs().format('MMMM').toLowerCase()
    const year = dayjs().format('YYYY')

    setSelectedMonth(month)
    setSelectedYear(year)
  }, [transactions, resetSignal])


  return (
    <div id="budget-overview" className="base-container !py-2">
      <Accordion
        type="single"
        collapsible
        className={`w-full rounded-lg my-0.5`}
        defaultValue="budget-overview"
      >
        <AccordionItem value="budget-overview">
          <AccordionTrigger className="py-0 clickable" iconOnRight>
            <h4 className="w-full text-center">Budget Overview</h4>
          </AccordionTrigger>
          <AccordionContent className="pt-3 text-base">

            <div className="flex justify-center gap-3 sm:gap-6">
              <div className="flex flex-wrap !text-center gap-2">
                <Select value={selectedYear} onValueChange={(val: string) => setSelectedYear(val)}>
                  <SelectTrigger className="!w-23 !h-8 !p-2">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year, idx) => (
                      <SelectItem key={idx} value={year}>
                        {year === OVERALL ? 'Overall' : year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedMonth} onValueChange={(val: string) => setSelectedMonth(val)}>
                  <SelectTrigger className="!w-30 !h-8 !p-2">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={OVERALL}>Overall</SelectItem>
                    <SelectItem value="january">January</SelectItem>
                    <SelectItem value="february">February</SelectItem>
                    <SelectItem value="march">March</SelectItem>
                    <SelectItem value="april">April</SelectItem>
                    <SelectItem value="may">May</SelectItem>
                    <SelectItem value="june">June</SelectItem>
                    <SelectItem value="july">July</SelectItem>
                    <SelectItem value="august">August</SelectItem>
                    <SelectItem value="september">September</SelectItem>
                    <SelectItem value="october">October</SelectItem>
                    <SelectItem value="november">November</SelectItem>
                    <SelectItem value="december">December</SelectItem>

                  </SelectContent>
                </Select>
              </div>

              <div
                onClick={triggerReset}
                className="flex justify-center bg-[var(--color-dark-blue)] py-[8px] px-[6px] rounded-full duration-200 hover:rotate-180 border-2 border-transparent hover:border-[var(--color-light-blue)] cursor-pointer"
              >
                <i title="Reset filters" className="fa-solid fa-rotate"></i>
              </div>
            </div>
            <Summary
              dateFilteredTransactions={dateFilteredTransactions}
              // selectedCurrency={selectedCurrency}
              totalExpense={totalExpense}
              isLoading={isLoading}
              displayAmount={displayAmount}
              incomeFilteredTransactions={incomeFilteredTransactions}
              expenseFilteredTransactions={expenseFilteredTransactions}
            />
            <hr className="text-[var(--color-dark-blue)] w-[85%] my-5" />
            <TransactionsList
              dateFilteredTransactions={dateFilteredTransactions}
              deleteTransaction={deleteTransaction}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              resetSignal={resetSignal}
              screenWidth={screenWidth}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
            <hr className="text-[var(--color-dark-blue)] w-[85%] my-3" />
            <ExpenseBreakdown
              dateFilteredTransactions={dateFilteredTransactions}
              screenWidth={screenWidth}
              selectedCurrency={selectedCurrency}
              totalExpense={totalExpense}
              isLoading={isLoading}
              displayAmount={displayAmount}
            />

          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export default BudgetOverview