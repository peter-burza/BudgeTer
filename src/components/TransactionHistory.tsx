'use state'

import React, { useEffect, useMemo, useState } from "react"
import TransactionsList, { sortDateNewestFirst } from "./TransactionsList"
import { calculateTotalSimplier, fancyNumber, getMonth, getMonthName, getMonthNumber, getYear, getYearsFromTransactions, roundToTwo } from "@/utils"
import { Transaction } from "@/interfaces"
import { TrType } from '@/enums'
import ExpenseBreakdown from "./ExpenseBreakdown"
import { Currency } from "@/types"
import { useCurrencyStore } from "@/context/CurrencyState"
import Summary from "./Summary"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/ShadcnComponents/select"

interface TransactionHistoryPtops {
    transactions: Transaction[]
    selectedCurrency: Currency
    deleteTransaction: (deleteTrId: string | undefined) => void
    screenWidth: number
    isLoading: boolean
}

const OVERALL = 'overall'

const TransactionHistory: React.FC<TransactionHistoryPtops> = ({ transactions, selectedCurrency, deleteTransaction, isLoading, screenWidth }) => {
    const baseCurrency = useCurrencyStore(state => state.baseCurrency)
    const convertGlobalFunc = useCurrencyStore(state => state.convertGlobalFunc)

    const convert = useCurrencyStore((state) => state.convert)

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
        const convertedTrAmountsPromises = expenseFilteredTransactions.map((t) => {
            return baseCurrency.code === selectedCurrency.code
                ? Promise.resolve(t.baseAmount)
                : t.currency.code === selectedCurrency.code
                    ? Promise.resolve(t.origAmount)
                    : convertGlobalFunc(t.currency.code, selectedCurrency.code, t.origAmount)
        })

        Promise.all(convertedTrAmountsPromises).then((resolvedAmounts) => {
            const total = calculateTotalSimplier(resolvedAmounts)
            setTotalExpense(roundToTwo(total))
        })
    }, [expenseFilteredTransactions, selectedCurrency])

    useEffect(() => {
        const income = dateFilteredTransactions.filter(t => t.type === TrType.Income);
        const expense = dateFilteredTransactions.filter(t => t.type === TrType.Expense);

        setIncomeFilteredTransactions(income);
        setExpenseFilteredTransactions(expense);
    }, [dateFilteredTransactions]);


    useEffect(() => { // to ensure that when the page is loaded and all data are fetched, the filter will set te latest Transaction date
        if (transactions.length === 0 || (selectedMonth !== "" && selectedYear !== "")) return

        const latest = sortDateNewestFirst(transactions)[0]
        const month = getMonthName(latest?.date.slice(5, 7) ?? '01').toLowerCase()
        const year = latest?.date.slice(0, 4) ?? '1970'

        setSelectedMonth(month)
        setSelectedYear(year)
    }, [transactions])

    useEffect(() => { // to ensure set Latest Transaction date after reset button is hitten
        if (transactions.length === 0) return

        const latest = sortDateNewestFirst(transactions)[0]
        const month = getMonthName(latest?.date.slice(5, 7) ?? '01').toLowerCase()
        const year = latest?.date.slice(0, 4) ?? '1970'

        setSelectedMonth(month)
        setSelectedYear(year)
    }, [resetSignal])


    return (
        <div id="transactions-history" className="base-container">
            <h3>Transactions History</h3>
            <div className="flex justify-between gap-3 sm:gap-6">
                <div className="flex flex-wrap gap-2">
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
                    className="flex justify-center bg-[var(--color-dark-blue)] py-[8px] px-[6px] rounded-full duration-200 hover:rotate-180 cursor-pointer"
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
                // selectedCurrency={selectedCurrency}
                dateFilteredTransactions={dateFilteredTransactions}
                deleteTransaction={deleteTransaction}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                resetSignal={resetSignal}
                screenWidth={screenWidth}
                isLoading={isLoading}
            // displayAmount={displayAmount}
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
        </div>
    )
}

export default TransactionHistory