'use client'

import { Transaction } from "@/lib/interfaces"
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useMemo, useState } from "react"
import { saveTransaction } from "@/lib"


type TransactionsContextType = {
    transactions: Transaction[]
    setTransactions: Dispatch<SetStateAction<Transaction[]>>
    clearTransactions: () => void
    isDuplicate: (id: string) => boolean
    saveUnloggedTransactions: (userId: string) => void
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

    const trSignatures = useMemo(() => {
        return new Set<string>(transactions.map(tx => tx.signature))
    }, [transactions])

    const clearTransactions = () => { setTransactions([]) }
    const isDuplicate = (signature: string) => {
        return trSignatures.has(signature)
    }

    function saveUnloggedTransactions(userId: string) {
        // If there is a record of any transactions before a registration of an user.
        if (userId && transactions.length > 0) {
            transactions.map((t) => {
                saveTransaction(t, userId)
            })
        }
    }

    const value: TransactionsContextType = {
        transactions,
        setTransactions,
        clearTransactions,
        isDuplicate,
        saveUnloggedTransactions
    }

    return (
        <TransactionsContext.Provider value={value}>
            {children}
        </TransactionsContext.Provider>
    )
}