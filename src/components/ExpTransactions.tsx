import { useExpTransactionsStore } from "@/context/ExpTransactionsStore"
import { useMemo, useState } from "react"
import { Category, TrType } from "@/lib/enums"
import { ExpectingTransaction } from "@/lib/interfaces"
import { useAppStore } from "@/context/AppStore"
import TransactionCard from "./TransactionCard"
import { useAuth } from "@/context/AuthContext"
import { deleteDoc, doc, setDoc } from "firebase/firestore"
import { db } from "../../firebase"
import AddExpectingTransaction from "./AddExpectingTransaction"
import GenericTable, { ColumnConfig } from "./GenericTable"

function sortPayDayHighFirst(list: ExpectingTransaction[]): ExpectingTransaction[] {
  return [...list].sort((a, b) => b.payDay - a.payDay)
}
function sortPayDayLowFirst(list: ExpectingTransaction[]): ExpectingTransaction[] {
  return [...list].sort((a, b) => a.payDay - b.payDay)
}
function sortAmountHighFirst(list: ExpectingTransaction[]): ExpectingTransaction[] {
  return [...list].sort((a, b) => b.origAmount - a.origAmount)
}
function sortAmountLowFirst(list: ExpectingTransaction[]): ExpectingTransaction[] {
  return [...list].sort((a, b) => a.origAmount - b.origAmount)
}

const ExpTransactions = () => {
  const { currentUser } = useAuth()
  const { expTransactions, setExpTransactions } = useExpTransactionsStore()
  const { screenWidth } = useAppStore()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [typeFilter, setTypeFilter] = useState<boolean | null>(null) // true = TrType.Income, false = TrType.Expense, null = all
  const [categoryFilter, setCategoryFilter] = useState<Category | null>(null)
  const [showAddExpectingTR, setShowAddExpectingTR] = useState<boolean>(false)

  // width ratio for the colums in the 'table'
  const widthRatio = {
    smalest: {
      hd_1: "4/18",
      hd_2: "3/18",
      hd_3: "8/18",
      hd_4: "3/18"
    },
    sm: {
      hd_1: "2/18",
      hd_2: "2/18",
      hd_3: "7/18",
      hd_4: "7/18"
    }
  }

  const transactionsList = useMemo(() => {
    let list = expTransactions

    // Category
    if (categoryFilter !== null) {
      list = list.filter((t) => t.category === categoryFilter)
    }

    // Type
    if (typeFilter !== null) {
      list = list.filter((t) => (typeFilter ? t.type === TrType.Expense : t.type === TrType.Income))
    }

    // default stable order: highest payDay first
    list = sortPayDayHighFirst(list)

    return list
  }, [
    expTransactions,
    categoryFilter,
    typeFilter,
  ])

  // Column configuration
  const columns: ColumnConfig[] = [
    {
      id: 'payDay',
      label: 'Date',
      iconClass: 'fa-calendar-days',
      smallRatio: '4/18',
      largeRatio: '2/18',
      sortable: true,
      sortAscending: (list) => sortPayDayLowFirst(list),
      sortDescending: (list) => sortPayDayHighFirst(list),
      clickable: true
    },
    {
      id: 'type',
      label: 'Type',
      iconClass: 'fa-arrow-down-up-across-line',
      smallRatio: '3/18',
      largeRatio: '2/18',
      onHeaderClick: () => setTypeFilter((prev) => (prev === null ? true : prev === true ? false : null)),
      headerClassName: typeFilter === false ? 'text-green-300' : typeFilter === true ? 'text-red-300' : '',
      clickable: true
    },
    {
      id: 'amount',
      label: 'Amount',
      iconClass: 'fa-coins',
      smallRatio: '8/18',
      largeRatio: '7/18',
      sortable: true,
      sortAscending: (list) => sortAmountLowFirst(list),
      sortDescending: (list) => sortAmountHighFirst(list),
      clickable: true
    },
    {
      id: 'category',
      label: 'Category',
      iconClass: 'fa-icons',
      smallRatio: '3/18',
      largeRatio: '7/18',
      onHeaderClick: () => setCategoryFilter(null),
      clickable: true
    },
  ]

  // Row renderer
  const renderRow = (transaction: ExpectingTransaction) => (
    <TransactionCard
      key={transaction.id}
      value={transaction.id}
      screenWidth={screenWidth}
      transaction={transaction}
      setCategoryFilter={setCategoryFilter}
      deleteTransaction={deleteExpTransaction}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
      widthRatio={widthRatio}
    />
  )

  // Handlers
  async function saveExpTransaction(newTr: ExpectingTransaction) {
    // Guard closes
    if (!newTr.id || isLoading) return
    if (!currentUser?.uid) {
      throw new Error("User is not authenticated")
    }

    // Save try
    try {
      setIsLoading(true)
      const trRef = doc(db, "users", currentUser?.uid, "expTransactions", newTr.id)
      const savingTransactionOnDb = await setDoc(trRef, newTr)
      setExpTransactions((prev) => [...prev, newTr])
      // console.log('Expecting transaction (id: ' + newTr.id + ') added successfully')
    } catch (error: unknown) {
      if (error instanceof Error) console.log(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteExpTransaction(deleteTrId: string | undefined) {
    // Guard closes
    if (isLoading || deleteTrId === undefined) return
    if (!currentUser?.uid) {
      throw new Error("User is not authenticated")
    }

    // Delete try
    try {
      setIsLoading(true)

      const transactionRef = doc(db, "users", currentUser?.uid, "expTransactions", deleteTrId)
      const removingTr = await deleteDoc(transactionRef)

      const updatedTransactions = expTransactions.filter(t => (t.id !== deleteTrId))
      setExpTransactions(updatedTransactions)
      // console.log('ExpTransaction (id: ' + deleteTrId + ') deleted successfully')
    } catch (error: unknown) {
      if (error instanceof Error) console.log(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div id="exp-transaction-list" className="flex flex-col w-full items-center gap-4">

      <GenericTable
        data={transactionsList}
        columns={columns}
        renderRow={renderRow}
        title="Expecting Transactions"
        screenWidth={screenWidth}
        isLoading={isLoading}
        emptyFilterMessage="No transactions for selected filter."
        emptyDataMessage="No transactions detected."
        showPagination={expTransactions.length > 10}
        initialItemCount={10}
        paginationStep={10}
        infoModalContent={
          <>
            <h4>Table usage info</h4>
            <ul className="flex flex-col gap-2 text-start">
              <li className="p-0.5">1. Click on a row for more details.</li>
              <li className="p-0.5">2. Click on the table headers to filter & reorder the list.</li>
              <li className="p-0.5">3. Click on specific category for category filtering.</li>
              <li className="p-0.5">4. Click on the header category icon for category filter reset.</li>
            </ul>
          </>
        }
      />
      {!showAddExpectingTR ? (
        <button onClick={() => setShowAddExpectingTR(true)} className="primary-btn">
          <h6 className="text-center">Add Expecting Transaction</h6>
        </button>
      ) : (
        <div id="add-expecting-transaction">
          <AddExpectingTransaction
            isLoading={isLoading}
            setShowAddExpectingTR={setShowAddExpectingTR}
            saveExpTransaction={saveExpTransaction}
          />
        </div>
      )}
    </div>
  )
}

export default ExpTransactions