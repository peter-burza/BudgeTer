'use client'

import { TrType } from "@/lib/enums"
import { Transaction } from "@/lib/interfaces"
import { CURRENCIES } from "@/lib/constants"
import { useMemo } from "react"
import { fancyNumber } from "@/lib"

interface SummaryDetailsProps {
    type: TrType
    dateFilteredTransactions: Transaction[]
}

const SummaryDetails: React.FC<SummaryDetailsProps> = ({ type, dateFilteredTransactions }) => {
    const currencySums = useMemo(() => {
        const transactions = dateFilteredTransactions.filter(t => t.type === type)

        const currencyMap: Record<string, { amount: number; count: number }> = {}

        transactions.forEach(t => {
            const currency = t.currency.code

            if (!currencyMap[currency]) {
                currencyMap[currency] = { amount: 0, count: 0 }
            }

            currencyMap[currency].amount += t.origAmount
            currencyMap[currency].count += 1
        })

        return Object.entries(currencyMap).map(([currency, data]) => ({
            currency,
            amount: data.amount,
            count: data.count
        }))
    }, [dateFilteredTransactions, type])


    return currencySums.map((c, idx) => {
        return (
            <div key={idx} className="flex flex-wrap justify-between w-full">
                <div>{c.count} tx in {CURRENCIES[c.currency].code}:</div>
                <div className="pr-6.5">
                    <div>{fancyNumber(c.amount)} {CURRENCIES[c.currency].symbol}</div>
                </div>
            </div>

        )
    })
}

export default SummaryDetails