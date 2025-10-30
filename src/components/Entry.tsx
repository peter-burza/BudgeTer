'use client'

import { Category } from '@/enums'
import React, { useEffect, useState } from 'react'
import ResponsiveDatePicker from './ui/ResponsiveDatePicker'
import dayjs from 'dayjs'
import { useCurrencyStore } from '@/context/CurrencyState'
import { TrType } from '@/enums'
import Modal from './Modal'
import { useTransactions } from '@/context/TransactionsContext'
import { Currency } from '@/types'
import { getCurrentDate, saveTransaction } from '@/utils'
import { useAuth } from '@/context/AuthContext'
import { CURRENCIES } from '@/utils/constants'

interface EntryProps {
  // saveTransaction: (transaction: Transaction) => void
  isLoading: boolean
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
}

export function handleDisplayZero(amount: number): string {
  return amount === 0 ? '' : amount.toString()
}

export function toBaseCurrency(
  amount: number,
  currencyCode: string,
  rate: number
): number {
  if (!rate) throw new Error(`Unknown currency: ${currencyCode}`)
  return amount / rate // divide to go from that currency to EUR
}

export function returnSignature(
  ...parts: (string | number | TrType | Category)[]
): string {
  return parts.join('|')
}

const Entry: React.FC<EntryProps> = ({ isLoading, setIsLoading }) => {
  const { currentUser } = useAuth()
  const { isDuplicate, setTransactions } = useTransactions()
  const baseCurrency = useCurrencyStore((state) => state.baseCurrency)
  const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency)
  const rates = useCurrencyStore((state) => state.rates)

  const [typedAmount, setTypedAmount] = useState<number>(0)
  const [type, setType] = useState<TrType>(TrType.Expense)
  const [date, setDate] = useState<string>(getCurrentDate('YYYY-MM-DD'))
  const [category, setCategory] = useState<Category>(Category.Other)
  const [description, setDescription] = useState<string>('')
  const [newTrCurrency, setNewTrCurrency] = useState<Currency>(selectedCurrency)
  const [showDuplicateTrQ, setShowDuplicateTRQ] = useState<boolean>(false)
  const [dontAskAgain, setDontAskAgain] = useState<boolean>(false)

  const cantAddEntry: boolean | undefined = typedAmount === 0 ? true : false
  const trSignatureStructure = [
    typedAmount,
    type,
    category,
    description,
    date,
    newTrCurrency.code
  ]

  function resetDefaultValues() {
    setTypedAmount(0)
    setType(TrType.Expense)
    setCategory(Category.Other)
    setDescription('')
    setNewTrCurrency(selectedCurrency)
  }

  function handleSetAmount(value: string): void {
    const parsedValue = parseFloat(value)
    const validValue = Number.isNaN(parsedValue) ? 0 : parsedValue
    setTypedAmount(Math.abs(validValue))
  }

  function handleSetType(value: TrType): void {
    setType(value)
  }

  function handleSetCategory(value: Category): void {
    setCategory(value)
  }

  function handleSetDate(value: dayjs.Dayjs): void {
    const dateOnly: string = value.format('YYYY-MM-DD')
    setDate(dateOnly)
  }

  function handleSetDescription(value: string): void {
    setDescription(value)
  }

  function handleSetCurrency(selectedCurrCode: string): void {
    setNewTrCurrency(CURRENCIES[selectedCurrCode])
  }

  function handleSaveTr() {
    const signature = returnSignature(...trSignatureStructure)
    if (isDuplicate(signature) && !dontAskAgain) {
      toggleShowDuplicateTrQ()
      return
    }
    saveTr()
  }

  function saveTr() {
    if (!currentUser) throw new Error('User is not authenticated')
    saveTransaction(
      {
        id: crypto.randomUUID(),
        signature: returnSignature(...trSignatureStructure),
        origAmount: typedAmount,
        baseAmount:
          newTrCurrency === baseCurrency
            ? typedAmount
            : toBaseCurrency(
                typedAmount,
                newTrCurrency.code,
                rates[newTrCurrency.code]
              ),
        currency: newTrCurrency,
        type: type,
        date: date,
        category: category,
        description: description,
        exchangeRate: rates[newTrCurrency.code]
      },
      currentUser.uid,
      setTransactions,
      setIsLoading
    )
    resetDefaultValues()
  }

  function saveDuplicateTR() {
    saveTr()
    toggleShowDuplicateTrQ()
  }

  function toggleShowDuplicateTrQ() {
    setShowDuplicateTRQ(!showDuplicateTrQ)
  }

  useEffect(() => {
    setNewTrCurrency(selectedCurrency)
  }, [selectedCurrency])

  return (
    <>
      <Modal
        onClose={toggleShowDuplicateTrQ}
        isOpen={showDuplicateTrQ}
        onConfirm={saveDuplicateTR}
      >
        <p className="px-5 pt-2">
          You are trying to add a duplicate transaction.
        </p>
        <div className="flex justify-evenly gap-1 w-full -mb-2.5">
          <button
            onClick={saveDuplicateTR}
            className="secondary-btn !p-0.75 items-center"
          >
            <p className="px-2">Confirm</p>
          </button>
          <button
            onClick={toggleShowDuplicateTrQ}
            className="secondary-btn !p-0.75 items-center"
          >
            <p className="px-2">Cancel</p>
          </button>
        </div>
        <div className="flex gap-2 w-full">
          <input
            className="max-w-4"
            type="checkbox"
            checked={dontAskAgain}
            onChange={(e) => setDontAskAgain(e.target.checked)}
          />
          <p>Don&apos;t ask again</p>
        </div>
      </Modal>

      <div
        id="transaction-entry"
        className="base-container"
      >
        <h3>New Entry</h3>
        <div className="flex flex-col gap-1 max-w-[232px] w-full">
          <p>Amount:</p>
          <div className="group relative w-full">
            <input
              value={handleDisplayZero(typedAmount)}
              onChange={(e) => handleSetAmount(e.target.value)}
              type="number"
              step="any"
              placeholder="e.g. 4.99"
              className="w-full pr-[70px] group-hover:!shadow-none" // leave space for the select
            />
            <select
              id="currency_select"
              value={newTrCurrency.code}
              onChange={(e) => handleSetCurrency(e.target.value)}
              className="absolute right-0 top-0 h-full !w-[68px] px-2 bg-transparent text-inherit cursor-pointer border-none !shadow-none text-right"
            >
              {Object.values(CURRENCIES).map((currency) => (
                <option
                  key={currency.code}
                  value={currency.code}
                  title={`${currency.code}  -  ${currency.name}  -  ${currency.symbol}`}
                >
                  {currency.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1 max-w-[232px] w-full">
          <p>Type:</p>
          <select
            value={type}
            onChange={(e) => {
              handleSetType(e.target.value as TrType)
            }}
          >
            <option value={TrType.Income}>Income</option>
            <option value={TrType.Expense}>Expense</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 max-w-[232px] w-full">
          <p>Category:</p>
          <select
            value={category}
            onChange={(e) => {
              handleSetCategory(e.target.value as Category)
            }}
          >
            {Object.values(Category).map((c, idx) => (
              <option
                key={idx}
                value={c}
              >
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 max-w-[232px] w-full">
          <p>Date:</p>
          <ResponsiveDatePicker setTransactionDate={handleSetDate} />
        </div>

        <div className="flex flex-col gap-1 max-w-[232px] w-full">
          <p className="">Description:</p>
          <textarea
            onChange={(e) => {
              handleSetDescription(e.target.value)
            }}
            className="bg-[var(--foreground)] text-[var(--background)] outline-0 p-2 px-3 rounded-sm"
            placeholder="Transaction detail"
          ></textarea>
        </div>

        <button
          className="secondary-btn disabled:opacity-50"
          disabled={cantAddEntry || isLoading}
          title={cantAddEntry ? 'Please enter amount' : ''}
          onClick={handleSaveTr}
        >
          <h5>{isLoading === true ? 'Loading...' : 'Add Transaction'}</h5>
        </button>
      </div>
    </>
  )
}

export default Entry
