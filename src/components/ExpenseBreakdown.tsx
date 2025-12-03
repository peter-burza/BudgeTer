'use client'

import { Transaction } from "@/lib/interfaces"
import { Category } from '@/lib/enums'
import { TrType } from '@/lib/enums'
import { useEffect, useState } from "react"
import { CategorySummary, Currency } from "@/lib/types"
import { useCurrencyStore } from "@/context/CurrencyState"
import { roundToTwo } from "@/lib"
import GenericTable, { ColumnConfig } from "./GenericTable"
import ExpenseBreakdownCard from "./ExpenseBreakdownCard"

interface ExpenseBreakdownProps {
  dateFilteredTransactions: Transaction[]
  screenWidth: number
  selectedCurrency: Currency
  totalExpense: number
  isLoading: boolean
  displayAmount: (amount: number, rate?: number) => string
}

function sortTotalHighFirst(list: CategorySummary[]): CategorySummary[] {
  return [...list].sort((a, b) => new Date(b.total).getTime() - new Date(a.total).getTime())
}
function sortTotalLowFirst(list: CategorySummary[]): CategorySummary[] {
  return [...list].sort((a, b) => new Date(a.total).getTime() - new Date(b.total).getTime())
}

const ExpenseBreakdown: React.FC<ExpenseBreakdownProps> = ({ dateFilteredTransactions, screenWidth, selectedCurrency, totalExpense, isLoading }) => {
  const baseCurrency = useCurrencyStore(state => state.baseCurrency)
  const convertGlobalFunc = useCurrencyStore(state => state.convertGlobalFunc)
  const [orderedBreakdown, setOrderedBreakdown] = useState<CategorySummary[]>([])

  const columns: ColumnConfig[] = [
    {
      id: 'category',
      label: 'Category',
      iconClass: 'fa-icons',
      smallRatio: '6/18',
      largeRatio: '6/18',
    },
    {
      id: 'total',
      label: 'Total',
      iconClass: 'fa-chart-simple',
      smallRatio: '6/18',
      largeRatio: '6/18',
      sortable: true,
      sortAscending: (list) => sortTotalHighFirst(list),
      sortDescending: (list) => sortTotalLowFirst(list),
      clickable: true
    },
    {
      id: 'percentage',
      label: 'Percentage',
      iconClass: 'fa-percent',
      smallRatio: '6/18',
      largeRatio: '6/18'
    },
  ]

  const renderRow = (categorySummary: CategorySummary, idx: number) => (
    <ExpenseBreakdownCard
      key={idx}
      screenWidth={screenWidth}
      categorySummary={categorySummary}
      widthRatio={{
        smalest: {
          hd_1: "1/3",
          hd_2: "1/3",
          hd_3: "1/3"
        },
        sm: {
          hd_1: "1/3",
          hd_2: "1/3",
          hd_3: "1/3"
        }
      }}
    />
  )


  async function getExpenseBreakdown(): Promise<CategorySummary[]> {
    const expenses = dateFilteredTransactions.filter(t => t.type === TrType.Expense)
    const categoryMap: Record<string, { transactions: typeof expenses, totalAmount: number }> = {}

    for (const e of expenses) {
      const category = e.category as Category
      if (!category) continue

      if (!categoryMap[category]) {
        categoryMap[category] = {
          transactions: [],
          totalAmount: 0,
        }
      }

      const amountAddition =
        baseCurrency.code === selectedCurrency.code
          ? e.baseAmount
          : e.currency.code === selectedCurrency.code
            ? e.origAmount
            : await convertGlobalFunc(e.currency.code, selectedCurrency.code, e.origAmount)

      categoryMap[category].transactions.push(e)
      categoryMap[category].totalAmount += roundToTwo(amountAddition)
    }

    return Object.entries(categoryMap).map(([categoryKey, data]) => {
      const category = categoryKey as Category
      return {
        category,
        total: data.totalAmount,
        percentage: totalExpense ? (data.totalAmount / totalExpense) * 100 : 0,
        currency: selectedCurrency
      }
    })
  }


  useEffect(() => {
    async function fetchBreakdown() {
      const breakdown = await getExpenseBreakdown()
      setOrderedBreakdown(breakdown)
    }

    fetchBreakdown()
  }, [dateFilteredTransactions, totalExpense])


  return (
    <GenericTable
      data={orderedBreakdown}
      columns={columns}
      renderRow={renderRow}
      title="Expense Breakdown"
      screenWidth={screenWidth}
      isLoading={isLoading}
      emptyFilterMessage="No expenses for selected period."
      emptyDataMessage="No expenses detected."
      showPagination={false}
      extraRightPadding={false}
    />
  )
}

export default ExpenseBreakdown
