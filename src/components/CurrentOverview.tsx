import { ExpectingTransaction, Transaction } from "@/lib/interfaces"
import { TrType } from "@/lib/enums"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/ShadcnComponents/accordion"
import { convertAmountToSelectedCurrency, fancyNumber, roundToTwo } from "@/lib"
import { useCurrentBalance } from "@/context/CurrentBalance"
import { useCurrencyStore } from "@/context/CurrencyState"
import { memo, useEffect, useMemo, useState } from "react"
import dayjs from "dayjs"
import { useFutureTransactions } from "@/context/FutureTransactions"
import { useExpTransactionsStore } from "@/context/ExpTransactionsStore"
import { useShallow } from 'zustand/react/shallow'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import customParseFormat from 'dayjs/plugin/customParseFormat'



dayjs.extend(isSameOrBefore)
dayjs.extend(customParseFormat)

const CurrentOverview = memo(function CurrentOverview() {
  const { currentBalance, balanceLedger, hasFetchedCurrentBalance } = useCurrentBalance(
    useShallow(state => ({
      currentBalance: state.currentBalance,
      balanceLedger: state.balanceLedger,
      hasFetchedCurrentBalance: state.hasFetchedCurrentBalance
    }))
  )

  const { selectedCurrency, baseCurrency, rates } = useCurrencyStore(
    useShallow(state => ({
      selectedCurrency: state.selectedCurrency,
      baseCurrency: state.baseCurrency,
      rates: state.rates
    }))
  )

  const futureTransactions = useFutureTransactions(state => state.futureTransactions)
  const hasFetchedFuture = useFutureTransactions(state => state.hasFetchedFuture)
  const expTransactions = useExpTransactionsStore(state => state.expTransactions)
  const hasFetchedExp = useExpTransactionsStore(state => state.hasFetchedExp)

  const { plannedList, totalPlannedAmount, expectedBalance, convertedBalance } = useMemo(() => {
    // 1. Calculate Converted Current Balance (Synchronously)
    let totalConverted = 0
    if (selectedCurrency.code === baseCurrency.code) {
      totalConverted = currentBalance
    } else {
      const ledgerKeys = Object.keys(balanceLedger)
      if (ledgerKeys.length > 0) {
        totalConverted = ledgerKeys.reduce((acc, currCode) => {
          const amount = balanceLedger[currCode]
          if (amount === 0) return acc

          if (currCode === selectedCurrency.code) return acc + amount

          // Convert to Base first
          const rateToBase = rates[currCode] || 1
          const amountInBase = currCode === baseCurrency.code ? amount : amount / rateToBase

          // Convert from Base to Selected
          const rateToSelected = rates[selectedCurrency.code] || 1
          return acc + (amountInBase * rateToSelected)
        }, 0)
      } else {
        // Fallback if ledger is empty
        const rateToSelected = rates[selectedCurrency.code] || 1
        totalConverted = currentBalance * rateToSelected
      }
    }

    // 2. Helper for Conversion (Calculated the same way as current balance)
    const convertToSelected = (origAmount: number, currCode: string) => {
      if (currCode === selectedCurrency.code) return origAmount

      // Convert to Base first
      const rateToBase = rates[currCode] || 1
      const amountInBase = currCode === baseCurrency.code ? origAmount : origAmount / rateToBase

      // Convert from Base to Selected
      const rateToSelected = rates[selectedCurrency.code] || 1
      return amountInBase * rateToSelected
    }

    // 3. Calculate Planned Transactions
    const relevantFutureTransactions = futureTransactions.filter((tx: Transaction) => {
      const txDate = dayjs(tx.date, ["DD.MM.YYYY", "YYYY-MM-DD"])
      return txDate.isValid() && txDate.isAfter(dayjs(), 'day') && txDate.isSameOrBefore(dayjs().endOf('month'), 'day')
    })
    const relevantExpTransactions = expTransactions.filter((tx: ExpectingTransaction) => {
      const txDay = tx.payDay // use the actual payDay from the object
      const today = dayjs().date() // today’s day of month
      const lastDayOfMonth = dayjs().endOf('month').date() // last day of this month

      return txDay > today && txDay <= lastDayOfMonth
    })

    const totalFutureTransactions = relevantFutureTransactions.reduce((acc: number, tx: Transaction) => {
      const converted = convertToSelected(tx.origAmount, tx.currency.code)
      return tx.type === TrType.Income ? acc + converted : acc - converted
    }, 0)
    const totalExpTransactions = relevantExpTransactions.reduce((acc: number, tx: ExpectingTransaction) => {
      const converted = convertToSelected(tx.origAmount, tx.currency.code)
      return tx.type === TrType.Income ? acc + converted : acc - converted
    }, 0)

    // Prepare list for UI
    const futureItems = relevantFutureTransactions.map((tx: Transaction) => ({
      id: tx?.id,
      category: tx.category,
      date: dayjs(tx.date, ["DD.MM.YYYY", "YYYY-MM-DD"]).format("DD.MM.YYYY"),
      amount: convertToSelected(tx.origAmount, tx.currency.code),
      type: tx.type
    }))

    const expItems = relevantExpTransactions.map((tx: ExpectingTransaction) => ({
      id: tx?.id,
      category: tx.category,
      date: dayjs().set('date', tx.payDay).format("DD.MM.YYYY"),
      amount: convertToSelected(tx.origAmount, tx.currency.code),
      type: tx.type
    }))

    const sortedList = [...futureItems, ...expItems].sort((a, b) =>
      dayjs(a.date, "DD.MM.YYYY").unix() - dayjs(b.date, "DD.MM.YYYY").unix()
    )

    const totalPlanned = roundToTwo(totalFutureTransactions + totalExpTransactions)
    const expected = roundToTwo(totalConverted + totalFutureTransactions + totalExpTransactions)

    return {
      plannedList: sortedList,
      totalPlannedAmount: totalPlanned,
      expectedBalance: expected,
      convertedBalance: roundToTwo(totalConverted)
    }
  }, [currentBalance, balanceLedger, selectedCurrency, baseCurrency, rates, futureTransactions, expTransactions])

  useEffect(() => {
    if (!hasFetchedCurrentBalance || !hasFetchedFuture || !hasFetchedExp) return

    // console.log("sortedList", plannedList)
    // console.log("TotalPlannedAmount", totalPlannedAmount)
    // console.log("ExpectedBalance", expectedBalance)
  }, [hasFetchedCurrentBalance, hasFetchedFuture, hasFetchedExp, plannedList, totalPlannedAmount, expectedBalance])





  return (
    <div id="current-overview" className="base-container">
      <div id="current-balance" className="w-full max-w-108 flex justify-between gap-2">
        <h5>Current balance</h5>
        <h5 className={`${convertedBalance > 0 ? 'text-green-400' : convertedBalance < 0 ? 'text-red-400' : ''} whitespace-nowrap`}>{fancyNumber(convertedBalance)} {selectedCurrency.symbol}</h5>
      </div>
      <div id="expected-balance" className="w-full max-w-108 flex justify-between gap-2">
        <h5>Expected balance <span className="text-base">({dayjs().endOf('month').format('DD.MM')})</span></h5>
        <h5 className={`${expectedBalance > 0 ? 'text-green-400' : expectedBalance < 0 ? 'text-red-400' : ''} whitespace-nowrap`}>{fancyNumber(expectedBalance)} {selectedCurrency.symbol}</h5>
      </div>
      <hr className="text-[var(--color-dark-blue)] w-full" />
      <Accordion
        type="single"
        collapsible
        className="rounded-lg my-0.5 w-full"
      >
        <AccordionItem value="planned-trnsactions">
          <AccordionTrigger className="p-0 gap-2 clickable" iconOnLeft>
            <div className="w-full flex justify-between">
              <h5 className="pl-5">Planned transactions</h5>
              <h5 className={`${totalPlannedAmount > 0 ? 'text-green-400' : totalPlannedAmount < 0 ? 'text-red-400' : ''} whitespace-nowrap`}>
                {fancyNumber(totalPlannedAmount)} {selectedCurrency.symbol}
              </h5>
            </div>
          </AccordionTrigger>
          <AccordionContent className="">
            <div className="flex flex-col py-1 pl-2">
              {plannedList.length === 0 ? (
                <p className="text-gray-500 py-2">No planned transactions for this month.</p>
              ) : plannedList.map((item) => (
                <div key={item.id}>
                  <hr className="text-[var(--background-muted_lighter)] w-full my-1" />
                  <div className="flex justify-between">
                    <div className="flex flex-col">
                      <h5>{item.category}</h5>
                      <p className="!text-[13px] md:!text-[15px] text-gray-400">{item.date}</p>
                    </div>
                    <h5 className={`${item.type === TrType.Income ? 'text-green-400' : 'text-red-400'} whitespace-nowrap`}>
                      {item.type === TrType.Income && '-'}{fancyNumber(item.amount)} {selectedCurrency.symbol}
                    </h5>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
})

export default CurrentOverview