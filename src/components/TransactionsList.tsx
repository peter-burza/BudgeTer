'use client'

import React, { useEffect, useMemo, useState } from 'react'
import TransactionCard from './TransactionCard'
import { Transaction } from '@/lib/interfaces'
import { Category } from '@/lib/enums'
import { TrType } from '@/lib/enums'
import GenericTable, { ColumnConfig } from './GenericTable'
import { useTransactions } from '@/context/TransactionsContext'

interface ListProps {
    // selectedCurrency: Currency
    dateFilteredTransactions: Transaction[]
    selectedMonth: string
    selectedYear: string
    resetSignal: number
    deleteTransaction: (deleteTrId: string | undefined) => void
    screenWidth: number
    isLoading: boolean
    // displayAmount: (amount: number) => string
}

export function sortDateNewestFirst(list: Transaction[]): Transaction[] {
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
function sortDateOldestFirst(list: Transaction[]): Transaction[] {
    return [...list].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}
function sortAmountHighFirst(list: Transaction[]): Transaction[] {
    return [...list].sort((a, b) => b.origAmount - a.origAmount)
}
function sortAmountLowFirst(list: Transaction[]): Transaction[] {
    return [...list].sort((a, b) => a.origAmount - b.origAmount)
}


const TransactionsList: React.FC<ListProps> = ({ dateFilteredTransactions, deleteTransaction, resetSignal, /*displayAmount,*/ screenWidth, isLoading }) => {
    const { transactions } = useTransactions()

    // Filters and sorting state
    const [typeFilter, setTypeFilter] = useState<boolean | null>(null) // true = TrType.Income, false = TrType.Expense, null = all
    const [categoryFilter, setCategoryFilter] = useState<Category | null>(null)

    // Width ratios for columns
    const widthRatio = {
        smalest: {
            hd_1: "7/18",
            hd_2: "2/18",
            hd_3: "7/18",
            hd_4: "2/18"
        },
        sm: {
            hd_1: "5/18",
            hd_2: "2/18",
            hd_3: "5/18",
            hd_4: "6/18"
        }
    }

    // Derived list (single source of truth)
    const transactionsList = useMemo(() => {
        let list = dateFilteredTransactions

        // Category
        if (categoryFilter !== null) {
            list = list.filter((t) => t.category === categoryFilter)
        }

        // Type
        if (typeFilter !== null) {
            list = list.filter((t) => (typeFilter ? t.type === TrType.Expense : t.type === TrType.Income))
        }

        // Default stable order: newest first
        list = sortDateNewestFirst(list)

        return list
    }, [
        dateFilteredTransactions,
        categoryFilter,
        typeFilter,
    ])

    // Reset filters
    useEffect(() => {
        setCategoryFilter(null)
        setTypeFilter(null)
    }, [resetSignal])

    // Column configuration
    const columns: ColumnConfig[] = [
        {
            id: 'date',
            label: 'Date',
            iconClass: 'fa-calendar-days',
            smallRatio: '7/18',
            largeRatio: '5/18',
            sortable: true,
            sortAscending: (list) => sortDateOldestFirst(list),
            sortDescending: (list) => sortDateNewestFirst(list),
            clickable: true
        },
        {
            id: 'type',
            label: 'Type',
            iconClass: 'fa-arrow-down-up-across-line',
            smallRatio: '2/18',
            largeRatio: '2/18',
            onHeaderClick: () => setTypeFilter((prev) => (prev === null ? true : prev === true ? false : null)),
            headerClassName: typeFilter === false ? 'text-green-300' : typeFilter === true ? 'text-red-300' : '',
            clickable: true
        },
        {
            id: 'amount',
            label: 'Amount',
            iconClass: 'fa-coins',
            smallRatio: '7/18',
            largeRatio: '5/18',
            sortable: true,
            sortAscending: (list) => sortAmountLowFirst(list),
            sortDescending: (list) => sortAmountHighFirst(list),
            clickable: true
        },
        {
            id: 'category',
            label: 'Category',
            iconClass: 'fa-icons',
            smallRatio: '2/18',
            largeRatio: '6/18',
            onHeaderClick: () => setCategoryFilter(null),
            clickable: true
        },
    ]

    // Row renderer
    const renderRow = (transaction: Transaction) => (
        <TransactionCard
            key={transaction.id}
            value={transaction.id}
            screenWidth={screenWidth}
            transaction={transaction}
            setCategoryFilter={setCategoryFilter}
            deleteTransaction={deleteTransaction}
            widthRatio={widthRatio}
        />
    )

    // Render
    return (
        <GenericTable
            data={transactionsList}
            columns={columns}
            renderRow={renderRow}
            title="Transactions List"
            screenWidth={screenWidth}
            isLoading={isLoading}
            emptyFilterMessage="No transactions for selected period."
            emptyDataMessage={transactions.length > 0 ? 'No transactions for selected period.' : 'No transactions detected.'}
            showPagination={true}
            initialItemCount={10}
            paginationStep={10}
            infoModalContent={
                <>
                    <h3>Table usage info</h3>
                    <ul className="flex flex-col gap-2 text-start">
                        <li className="p-1.5">1. Click on a row for more details.</li>
                        <li className="p-1.5">2. Click on the table headers to filter & reorder the list.</li>
                        <li className="p-1.5">3. Click on specific category for category filtering.</li>
                        <li className="p-1.5">4. Click on the header category icon for category filter reset.</li>
                    </ul>
                </>
            }
        />
    )
}

export default TransactionsList
