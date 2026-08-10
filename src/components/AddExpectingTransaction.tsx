'use client'

import { useState } from "react"
import Modal from "./Modal"
import { handleDisplayZero, returnSignature, toBaseCurrency } from "./Entry"
import { Category, TrType } from "@/lib/enums"
import dayjs from "dayjs"
import { Currency } from "@/lib/types"
import { useCurrencyStore } from "@/context/CurrencyState"
import { CategoryIcons, generateRandomUUID, getCurrentDay } from "@/lib"
import ResponsiveDatePicker from "./ui/ResponsiveDatePicker"
import { ExpectingTransaction } from "@/lib/interfaces"
import { useExpTransactionsStore } from "@/context/ExpTransactionsStore"
import { CURRENCIES } from "@/lib/constants"
import { Label } from "./ui/ShadcnComponents/label"
import { Input } from "./ui/ShadcnComponents/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/ShadcnComponents/select"
import { Textarea } from "./ui/ShadcnComponents/textarea"


interface AddExpectingTransactionProps {
  isLoading: boolean
  setShowAddExpectingTR: React.Dispatch<React.SetStateAction<boolean>>
  saveExpTransaction: (newTr: ExpectingTransaction) => void
}


const AddExpectingTransaction: React.FC<AddExpectingTransactionProps> = ({ isLoading, setShowAddExpectingTR, saveExpTransaction }) => {
  const { isDuplicate } = useExpTransactionsStore()
  const baseCurrency = useCurrencyStore((state) => state.baseCurrency)
  const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency)
  const rates = useCurrencyStore((state) => state.rates)

  const [typedAmount, setTypedAmount] = useState<number>(0)
  const [type, setType] = useState<TrType>(TrType.Expense)
  const [payDay, setPayDay] = useState<number>(getCurrentDay())
  const [startDate, setStartDate] = useState<string>(dayjs(Date.now()).format('YYYY-MM-DD'))
  const [category, setCategory] = useState<Category>(Category.Other)
  const [description, setDescription] = useState<string>('')
  const [newTrCurrency, setNewTrCurrency] = useState<Currency>(selectedCurrency)
  const [payDayTooHigh, setPayDayTooHigh] = useState<boolean>(false)
  const [showDuplicateTrQ, setShowDuplicateTRQ] = useState<boolean>(false)
  const [dontAskAgain, setDontAskAgain] = useState<boolean>(false)
  const [showStartDateInfo, setShowStartDateInfo] = useState<boolean>(false)

  const expTrSignatureStructure = [typedAmount, type, category, description, payDay, startDate, newTrCurrency.code]

  const cantAddEntry: boolean | undefined = typedAmount === 0 ? true : false


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

  function handleProcessDate(value: dayjs.Dayjs): void {
    const dateOnly: string = value.format('YYYY-MM-DD')
    setStartDate(dateOnly)
    setPayDay(Number(dateOnly.slice(8)))
  }

  function handleSetDescription(value: string): void {
    setDescription(value)
  }

  function handleSetCurrency(selectedCurrCode: string): void {
    setNewTrCurrency(CURRENCIES[selectedCurrCode])
  }

  function resetDefaultValues() {
    setTypedAmount(0)
    setType(TrType.Expense)
    setCategory(Category.Other)
    setDescription('')
    setNewTrCurrency(selectedCurrency)
  }

  function toggleShowDuplicateTrQ() {
    setShowDuplicateTRQ(!showDuplicateTrQ)
  }

  function handleSaveExpTr() {
    if (payDay > 28) {
      setPayDayTooHigh(true)
      return
    }

    const signature = returnSignature(...expTrSignatureStructure)
    if (isDuplicate(signature) && !dontAskAgain) {
      toggleShowDuplicateTrQ()
      return
    }
    saveExpTr()
  }

  function saveExpTr() {
    saveExpTransaction({
      id: generateRandomUUID(),
      origAmount: typedAmount,
      baseAmount: (
        newTrCurrency.code === baseCurrency.code
          ? typedAmount
          : toBaseCurrency(typedAmount, newTrCurrency.code, rates[newTrCurrency.code])
      ),
      currency: newTrCurrency,
      signature: returnSignature(...expTrSignatureStructure),
      type: type,
      payDay: payDay,
      startDate: startDate,
      category: category,
      description: description,
      exchangeRate: rates[newTrCurrency.code] || 1,
      processedMonths: []
    })
    resetDefaultValues()
  }

  function saveDuplicateExpTr() {
    saveExpTr()
    toggleShowDuplicateTrQ()
  }

  function toggleShowStartDateInfo() {
    setShowStartDateInfo(!showStartDateInfo)
  }


  return (
    <>
      <hr className="text-[var(--color-dark-blue)] mx-auto w-[85%] mb-2 mt-2" />

      {/* Repeat day too high */}
      <Modal onClose={() => setPayDayTooHigh(false)} isOpen={payDayTooHigh} includeOk>
        <p className="pt-5">Please make the repeating day max 28 (cause on february we won&apos;t be able to process the transaction 😂)</p>
      </Modal>

      <Modal onClose={toggleShowDuplicateTrQ} isOpen={showDuplicateTrQ} onConfirm={saveDuplicateExpTr}>
        <p className='px-5 pt-2 text-center'>You are trying to add a duplicate transaction.</p>
        <div className="flex justify-evenly gap-1 w-full -mb-2.5">
          <button
            onClick={saveDuplicateExpTr}
            className='primary-btn !p-0.75 items-center'>
            <p className='px-2'>Confirm</p>
          </button>
          <button onClick={toggleShowDuplicateTrQ} className='primary-btn !p-0.75 items-center'>
            <p className='px-2'>Cancel</p>
          </button>
        </div>
        <div className='flex gap-2 w-full'>
          <input
            className='max-w-4'
            type="checkbox"
            checked={dontAskAgain}
            onChange={(e) => setDontAskAgain(e.target.checked)}
          />
          <p>Don&apos;t ask again</p>
        </div>
      </Modal>

      <div className="flex flex-col gap-[0.5rem] items-center pt-4">
        <button onClick={() => setShowAddExpectingTR(false)} className="border-1 rounded-full hover:border-[var(--color-light-blue)] border-transparent duration-200 cursor-pointer bg-[var(--color-dark-blue)]">
          <div className="flex px-2 py-2.5">
            <i className="fa-solid fa-angle-down text-base text-sky-200 duration-200 rotate-180"></i>
          </div>
        </button>

        <div className="flex flex-col gap-1 max-w-[232px] w-full">
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

        <div className="flex flex-col gap-1 max-w-[232px] w-full">
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

        <div className="flex flex-col gap-1 max-w-[232px] w-full">
          <Label htmlFor="category">Category:</Label>
          <Select value={category} onValueChange={(val: Category) => handleSetCategory(val)}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(Category).map((c, idx) => (
                <SelectItem key={idx} value={c}>
                  {CategoryIcons[c]} {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Modal onClose={toggleShowStartDateInfo} isOpen={showStartDateInfo}>
          <>
            <h4>Start Date info</h4>
            <ul className="flex flex-col gap-2 text-start">
              <li className="p-0.5">1. Start Date represents also a day, when the transaction will be processed every month.</li>
              <li className="p-0.5">2. Please make the day max 28 (cause on february we won&apos;t be able to process the transaction 😂)</li>
            </ul>
          </>
        </Modal>

        <div className="flex flex-col gap-1 max-w-[232px] w-full">
          <div className="flex gap-1">
            <Label htmlFor="date">Start date:</Label>
            <i
              onClick={toggleShowStartDateInfo}
              className="fa-solid fa-circle-info clickable duration-200 text-sky-300"
            ></i>
          </div>
          <ResponsiveDatePicker setTransactionDate={handleProcessDate} />
        </div>

        <div className="flex flex-col gap-1 max-w-[232px] w-full">
          <Label htmlFor="description">Description:</Label>
          <Textarea
            id="message"
            placeholder="Transaction detail."
            value={description}
            handleSetDescription={handleSetDescription}
          />
        </div>

        <button
          className="primary-btn disabled:opacity-50 !block"
          disabled={cantAddEntry || isLoading}
          title={cantAddEntry ? 'Please enter amount' : ''}
          onClick={handleSaveExpTr}
        >
          <h6>{isLoading === true ? 'Adding...' : 'Add Expecting Transaction'}</h6>
        </button>
      </div >
    </>
  )
}

export default AddExpectingTransaction