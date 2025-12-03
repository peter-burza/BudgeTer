'use client'

import { Category } from '@/lib/enums'
import React, { useEffect, useState } from 'react'
import ResponsiveDatePicker from './ui/ResponsiveDatePicker'
import dayjs from 'dayjs'
import { useCurrencyStore } from '@/context/CurrencyState'
import { TrType } from '@/lib/enums'
import Modal from './Modal'
import { useTransactions } from '@/context/TransactionsContext'
import { Currency } from '@/lib/types'
import { CategoryIcons, generateRandomUUID, getCurrentDate, saveTransaction } from '@/lib'
import { useAuth } from '@/context/AuthContext'
import { CURRENCIES } from '@/lib/constants'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/ShadcnComponents/select"
import { Label } from "@/components/ui/ShadcnComponents/label"
import { Input } from './ui/ShadcnComponents/input'
import { Textarea } from './ui/ShadcnComponents/textarea'

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

  useEffect(() => {
    console.log(category)

  }, [category])

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
    const newTr = {
      id: generateRandomUUID(),
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
    }

    if (!currentUser) {
      // We didn't find any user logged in, so we save the Tr just for current session
      setTransactions((prev) => [...prev, newTr])
    } else {
      // We found user so save transaction into database under his profile
      saveTransaction(
        newTr,
        currentUser.uid,
        setIsLoading,
        setTransactions
      )
    }

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
            className="primary-btn !p-0.75 items-center"
          >
            <p className="px-2">Confirm</p>
          </button>
          <button
            onClick={toggleShowDuplicateTrQ}
            className="primary-btn !p-0.75 items-center"
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
        <div className="flex flex-col gap-1.5 max-w-[232px] w-full">
          <Label htmlFor="amount">Amount:</Label>
          <div className="group relative w-full">
            <Input
              id="amount"
              value={handleDisplayZero(typedAmount)}
              onChange={(e) => handleSetAmount(e.target.value)}
              type="number"
              step="any"
              placeholder="e.g. 4.99"
              className="w-full pr-[80px]" // leave space for the select and padding
            />
            <div className="absolute right-0 top-0 h-full w-[80px]">
              <Select
                value={newTrCurrency.code}
                onValueChange={(val: string) => handleSetCurrency(val)}
              >
                <SelectTrigger className="h-full w-full !bg-transparent !border-0 !shadow-none hover:!shadow-none focus:!shadow-none focus:!ring-0 pl-2 pr-3 text-right rounded-none rounded-r-lg !justify-end gap-2 [&_svg]:opacity-50">
                  <SelectValue className="!justify-end" />
                </SelectTrigger>
                <SelectContent className="!min-w-[68px] w-auto max-w-[100px]">
                  {Object.values(CURRENCIES).map((currency) => (
                    <SelectItem
                      key={currency.code}
                      value={currency.code}
                      title={`${currency.code}  -  ${currency.name}  -  ${currency.symbol}`}
                    >
                      {currency.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 max-w-[232px] w-full">
          <Label htmlFor="type">Type:</Label>
          <Select
            value={type}
            onValueChange={(val: TrType) => handleSetType(val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TrType.Income}>Income</SelectItem>
              <SelectItem value={TrType.Expense}>Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2 max-w-[232px] w-full">
          <Label htmlFor="category">Category:</Label>
          <Select value={category} onValueChange={(val: Category) => handleSetCategory(val)}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(Category).map((c, idx) => (
                <SelectItem key={idx} value={c}>
                      {c} {CategoryIcons[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2 max-w-[232px] w-full">
          <Label htmlFor="date">Date:</Label>
          <ResponsiveDatePicker setTransactionDate={handleSetDate} />
        </div>

        <div className="flex flex-col gap-2 max-w-[232px] w-full">
          <Label htmlFor="description">Description:</Label>
          <Textarea
            id="message"
            placeholder="Transaction detail."
            value={description}
            handleSetDescription={handleSetDescription}
          />
        </div>

        <button
          className="primary-btn disabled:opacity-50"
          disabled={cantAddEntry || isLoading}
          title={cantAddEntry ? 'Please enter amount' : ''}
          onClick={handleSaveTr}
        >
          <h5>{isLoading === true ? 'Loading...' : 'Add Transaction'}</h5>
        </button>
      </div >
    </>
  )
}

export default Entry
