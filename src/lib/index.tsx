import { JSX } from "@emotion/react/jsx-runtime"
import { ExpectingTransaction, Transaction } from "./interfaces"
import { Rates } from "./types"
import { Category, TrType } from "@/lib/enums"
import dayjs from "dayjs"
import { arrayUnion, collection, doc, getDocs, increment, runTransaction, updateDoc } from "firebase/firestore"
import { db } from "../../firebase"
import { User } from "firebase/auth"
import { returnSignature } from "@/components/Entry"



export const CategoryIcons: Record<Category, JSX.Element> = {
  [Category.Salary]: (
    <i
      className="fa-solid fa-money-check-dollar"
      title="Salary"
    ></i>
  ),
  [Category.Rent]: (
    <i
      className="fa-solid fa-person-cane"
      title="Rent"
    ></i>
  ),
  [Category.Groceries]: (
    <i
      className="fa-solid fa-cart-shopping"
      title="Groceries"
    ></i>
  ),
  [Category.Food]: (
    <i
      className="fa-solid fa-utensils"
      title="Food"
    ></i>
  ),
  [Category.InternetPhone]: (
    <i
      className="fa-solid fa-globe"
      title="Internet & Phone"
    ></i>
  ),
  [Category.HealthInsurance]: (
    <i
      className="fa-solid fa-notes-medical"
      title="Health Insurance"
    ></i>
  ),
  [Category.Savings]: (
    <i
      className="fa-solid fa-piggy-bank"
      title="Savings"
    ></i>
  ),
  [Category.FixedExp]: (
    <i
      className="fa-solid fa-wallet"
      title="Fixed Expenses"
    ></i>
  ),
  [Category.Shopping]: (
    <i
      className="fa-solid fa-bag-shopping"
      title="Shopping"
    ></i>
  ),
  [Category.Entertainment]: (
    <i
      className="fa-solid fa-microphone-lines"
      title="Entertainment"
    ></i>
  ),
  [Category.CarMaintenance]: (
    <i
      className="fa-solid fa-car"
      title="Car Maintenance"
    ></i>
  ),
  [Category.KidsSchool]: (
    <i
      className="fa-solid fa-child"
      title="Kids & School"
    ></i>
  ),
  [Category.Pets]: (
    <i
      className="fa-solid fa-paw"
      title="Pets"
    ></i>
  ),
  [Category.GymFitness]: (
    <i
      className="fa-solid fa-dumbbell"
      title="Gym & Fitness"
    ></i>
  ),
  [Category.StreamingServices]: (
    <i
      className="fa-solid fa-tv"
      title="Streaming Services"
    ></i>
  ),
  [Category.Home]: (
    <i
      className="fa-solid fa-house-chimney"
      title="Home"
    ></i>
  ),
  [Category.Investment]: (
    <i
      className="fa-solid fa-money-bill-trend-up"
      title="Investment"
    ></i>
  ),
  [Category.Vacation]: (
    <i
      className="fa-solid fa-umbrella-beach"
      title="Vacation"
    ></i>
  ),
  [Category.Birthdays]: (
    <i
      className="fa-solid fa-cake-candles"
      title="Birthdays"
    ></i>
  ),
  [Category.Christmass]: (
    <i
      className="fa-solid fa-gift"
      title="Christmas"
    ></i>
  ),
  [Category.Party]: (
    <i
      className="fa-solid fa-champagne-glasses"
      title="Party"
    ></i>
  ),
  [Category.Date]: (
    <i
      className="fa-solid fa-heart"
      title="Date"
    ></i>
  ),
  [Category.Garden]: (
    <i
      className="fa-solid fa-tree"
      title="Garden"
    ></i>
  ),
  [Category.Other]: (
    <i
      className="fa-solid fa-star-of-life"
      title="Other"
    ></i>
  )
}

// FUNCTIONS
export function getMonthName(monthNum: string): string {
  switch (monthNum) {
    case "01":
      return 'January'
    case "02":
      return 'February'
    case "03":
      return 'March'
    case "04":
      return 'April'
    case "05":
      return 'May'
    case "06":
      return 'June'
    case "07":
      return 'July'
    case "08":
      return 'August'
    case "09":
      return 'September'
    case "10":
      return 'October'
    case "11":
      return 'November'
    case "12":
      return 'December'
    default:
      return 'Invalid month'
  }
}

export function getMonthNumber(monthName: string): string {
  switch (monthName.toLowerCase()) {
    case 'january':
      return '01'
    case 'february':
      return '02'
    case 'march':
      return '03'
    case 'april':
      return '04'
    case 'may':
      return '05'
    case 'june':
      return '06'
    case 'july':
      return '07'
    case 'august':
      return '08'
    case 'september':
      return '09'
    case 'october':
      return '10'
    case 'november':
      return '11'
    case 'december':
      return '12'
    default:
      return 'Invalid month'
  }
}

export function getMonth(date: string): string {
  return date.slice(5, 7)
}

export function getYear(date: string): string {
  return date.slice(0, 4)
}

export function getYearsFromTransactions(transactions: Transaction[]): string[] {
  const yearsSet = new Set<string>()

  for (const t of transactions) {
    const year = t.date.slice(0, 4)
    yearsSet.add(year)
  }

  return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a))
}

export function calculateTotalSimplier(amounts: number[]): number {
  return amounts.reduce((sum, amount) => {
    return sum + amount
  }, 0)
}

// Convert one amount to selected currency
export async function convertAmountToSelectedCurrency(
  selectedCurrencyCode: string,
  baseCurrencyCode: string,
  convertGlobalFunc: (from: string, to: string, amount: number) => Promise<number>,
  amountInBase: number,
  amountInOrig?: number,
  origCurrencyCode?: string
): Promise<number> {
  // 1. If selected is base, we return amountInBase
  if (selectedCurrencyCode === baseCurrencyCode) {
    return Promise.resolve(amountInBase)
  }

  // 2. If selected matches original currency, return amountInOrig
  if (origCurrencyCode && selectedCurrencyCode === origCurrencyCode && amountInOrig !== undefined) {
    return Promise.resolve(amountInOrig)
  }

  // 3. Fallback: Convert
  // If we have original currency and amount, convert from that (usually 1 step)
  // Otherwise convert from base (conceptually could be "base -> selected")
  if (origCurrencyCode && amountInOrig !== undefined) {
    return convertGlobalFunc(origCurrencyCode, selectedCurrencyCode, amountInOrig)
  }

  return convertGlobalFunc(baseCurrencyCode, selectedCurrencyCode, amountInBase)
}

export async function calculateTotalInCurrency(
  transactions: Transaction[],
  selectedCurrencyCode: string,
  baseCurrencyCode: string,
  convertGlobalFunc: (from: string, to: string, amount: number) => Promise<number>
): Promise<number> {
  const convertedTrAmountsPromises = transactions.map((t) => {
    return convertAmountToSelectedCurrency(
      selectedCurrencyCode,
      baseCurrencyCode,
      convertGlobalFunc,
      t.baseAmount,
      t.origAmount,
      t.currency.code
    )
  })

  const resolvedAmounts = await Promise.all(convertedTrAmountsPromises)
  const total = calculateTotalSimplier(resolvedAmounts)
  return roundToTwo(total)
}

export function handleToggle(x: boolean, setX: React.Dispatch<React.SetStateAction<boolean>>): void {
  setX(!x)
}

export function roundToTwo(num: number): number {
  return Math.round(num * 100) / 100
}

export function fancyNumber(num: number): string {
  return Number(num.toFixed(2)).toLocaleString().replace(/,/g, ' ')
}

export function displayCategory(category: Category, screenWidth: number): string | JSX.Element {
  return screenWidth > 600 ? category : CategoryIcons[category]
}

export function getCurrentDay() {
  return dayjs().date()
}

export function getCurrentDate(format: string) {
  return dayjs().format(format)
}

export function hasMultipleCurrencies(transactions: Transaction[]) {
  const seen = new Set<string>()

  for (const tr of transactions) {
    seen.add(tr.currency.code)
    if (seen.size > 1) return true // early exit
  }

  return false
}

export async function saveTransaction(
  newTr: Transaction,
  currentUserUid: string,
  updateCurrentBalance?: (amount: number) => void,
  setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>,
  setTransactions?: (updater: (prev: Transaction[]) => Transaction[]) => void,
  updateLedger?: (currency: string, amount: number) => void,
  addFutureTransaction?: (tx: Transaction) => void,
): Promise<void> {
  const isIncome = newTr.type === TrType.Income
  const isFuture = dayjs(newTr.date).isAfter(dayjs(), 'day')

  // Set state
  newTr.hasTransactionCompleted = !isFuture

  try {
    setIsLoading?.(true)

    await runTransaction(db, async (transaction) => {
      if (!newTr.id) return

      const userRef = doc(db, "users", currentUserUid)
      const trRef = doc(db, "users", currentUserUid, "transactions", newTr.id)

      const userSnap = await transaction.get(userRef)

      if (!userSnap.exists()) {
        throw new Error("User does not exist")
      }

      // tr save to main transactions
      transaction.set(trRef, newTr)

      // If future, we save to future transactions collection and EXIT without balance update
      if (isFuture) {
        const futureTrRef = doc(db, "users", currentUserUid, "futureTransactions", newTr.id)
        transaction.set(futureTrRef, newTr)
        return // Exit transaction (don't update balance)
      }

      // --- Past/Today Logic Below ---

      const currBalance = userSnap.data().currentBalance

      if (typeof currBalance !== "number") {
        throw new Error("Current balance is not initialized")
      }

      // atomic balance update
      const updates: Record<string, number | ReturnType<typeof increment>> = {
        currentBalance: isIncome ? increment(newTr.baseAmount) : increment(-newTr.baseAmount)
      }

      if (userSnap.data().balanceLedger) {
        updates[`balanceLedger.${newTr.currency.code}`] = isIncome ? increment(newTr.origAmount) : increment(-newTr.origAmount)
        transaction.update(userRef, updates)
      } else {
        // If ledger doesn't exist, creation with merge
        transaction.set(userRef, {
          currentBalance: userSnap.data().currentBalance + (isIncome ? newTr.baseAmount : -newTr.baseAmount),
          balanceLedger: {
            [newTr.currency.code]: isIncome ? newTr.origAmount : -newTr.origAmount
          }
        }, { merge: true })
      }
    })

    // Local state updates
    // Always add to transactions list so user sees it
    setTransactions?.((prev) => [...prev, newTr])

    // Only update local balance/ledger if it's NOT future
    if (!isFuture) {
      updateCurrentBalance?.(isIncome ? newTr.baseAmount : -newTr.baseAmount)
      updateLedger?.(newTr.currency.code, isIncome ? newTr.origAmount : -newTr.origAmount)
    } else { // Add to local future transactions if it's future
      addFutureTransaction?.(newTr)
    }

    // console.log(`Transaction (id: ${newTr.id}) saved successfully. Future: ${isFuture}`)
  } catch (error: unknown) {
    if (error instanceof Error) { } // console.log(error.message)
  } finally {
    setIsLoading?.(false)
  }
}

export function getMissingMonthsForExpTr(
  startDate: string,
  processedMonths: Set<string>
): string[] {

  const start = dayjs(startDate).startOf('month')
  const end = dayjs().subtract(1, 'month').startOf('month')

  const missingMonths: string[] = []
  let current = start

  while (current.isBefore(end) || current.isSame(end)) {
    const monthKey = current.format('YYYY-MM')
    if (!processedMonths.has(monthKey)) {
      missingMonths.push(monthKey)
    }
    current = current.add(1, 'month')
  }
  return missingMonths
}

async function updateExpTransactionField(
  userId: string,
  transactionId: string,
  fieldKey: string,
  newValue: string
) {
  const transactionRef = doc(db, "users", userId, "expTransactions", transactionId)

  try {
    await updateDoc(transactionRef, {
      [fieldKey]: arrayUnion(newValue),
    })
    // console.log(`Updated ${fieldKey} in expTransaction ${transactionId}`)
  } catch (error) {
    console.error("Error updating expTransaction:", error)
  }
}

export async function processExpTransactions(
  expTransactions: ExpectingTransaction[],
  currentUser: User | null,
  setTransactions: (updater: (prev: Transaction[]) => Transaction[]) => void,
  updateCurrentBalance: (amount: number) => void,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  rates: Rates,
  updateLedger?: (currency: string, amount: number) => void
) {
  if (!currentUser) throw new Error('User is not authenticated')
  // const rates = useCurrencyStore.getState().rates
  const currentDayOfMonth = dayjs().date()
  // console.log(expTransactions);

  expTransactions.forEach((expTr) => {
    // check if the expTr was made for every month till its startAt month
    const processedMonths = new Set(expTr.processedMonths)
    const unprocessedMonths = getMissingMonthsForExpTr(expTr.startDate, processedMonths)

    if (unprocessedMonths.length > 0) {
      unprocessedMonths.map((month) => {
        const fullDate = `${month}-${expTr.payDay.toString().padStart(2, '0')}`
        saveTransaction(
          {
            id: generateRandomUUID(),
            signature: returnSignature(expTr.origAmount, expTr.type, expTr.category, (expTr.description === undefined ? '' : expTr.description), fullDate, expTr.currency.code),
            origAmount: expTr.origAmount,
            baseAmount: expTr.baseAmount,
            currency: expTr.currency,
            type: expTr.type,
            date: fullDate,
            category: expTr.category,
            description: `${expTr.description} (added from unprocessedMonths)`,
            exchangeRate: rates[expTr.currency.code],
            hasTransactionCompleted: true
          },
          currentUser.uid,
          updateCurrentBalance,
          setIsLoading,
          setTransactions,
          updateLedger
        )
        // Add month to the processedMonths array
        if (expTr.id) {
          updateExpTransactionField(currentUser.uid, expTr.id, 'processedMonths', month)
          expTr.processedMonths.push(month)
          // console.log(month + ' added to processedMonths for expTr (' + expTr.id + ')')
        } else { } // console.log('expTr.id is not available')
      })
      // console.log('expTr (' + expTr.id + ') has been processed for: ' + unprocessedMonths)
    }

    //check if tr has to be processed this month
    if (currentDayOfMonth >= expTr.payDay && !processedMonths.has(getCurrentDate('YYYY-MM'))) {
      // save the transaction if it should be processed this month
      const currentDate = getCurrentDate('YYYY-MM-DD')
      const currentMonth = getCurrentDate('YYYY-MM')
      saveTransaction(
        {
          id: generateRandomUUID(),
          signature: returnSignature(expTr.origAmount, expTr.type, expTr.category, (expTr.description === undefined ? '' : expTr.description), currentDate, expTr.currency.code),
          origAmount: expTr.origAmount,
          baseAmount: expTr.baseAmount,
          currency: expTr.currency,
          type: expTr.type,
          date: currentDate,
          category: expTr.category,
          description: expTr.description,
          exchangeRate: rates[expTr.currency.code] || 1,
          hasTransactionCompleted: true
        },
        currentUser.uid,
        updateCurrentBalance,
        setIsLoading,
        setTransactions,
        updateLedger
      )
      // Add month to the processedMonths array
      if (expTr.id) {
        updateExpTransactionField(currentUser.uid, expTr.id, 'processedMonths', currentMonth)
        expTr.processedMonths.push(currentMonth)
        // console.log(currentMonth + ' added to processedMonths for expTr (' + expTr.id + ')')
      } else { } // console.log('expTr.id is not available')
    }
  })
}

export function generateRandomUUID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // Fallback using crypto.getRandomValues
  const buf = new Uint8Array(16)
  crypto.getRandomValues(buf)

  // Set RFC4122 version bits
  buf[6] = (buf[6] & 0x0f) | 0x40
  buf[8] = (buf[8] & 0x3f) | 0x80

  const hex = [...buf].map(b => b.toString(16).padStart(2, "0")).join("")
  return (
    hex.substring(0, 8) +
    "-" +
    hex.substring(8, 12) +
    "-" +
    hex.substring(12, 16) +
    "-" +
    hex.substring(16, 20) +
    "-" +
    hex.substring(20)
  )
}

export async function processFutureTransactions(
  currentUserUid: string,
  updateCurrentBalance?: (amount: number) => void,
  updateLedger?: (currency: string, amount: number) => void,
  deleteFutureTransaction?: (id: string) => void
) {
  const futureTrsRef = collection(db, 'users', currentUserUid, 'futureTransactions')
  const snapshot = await getDocs(futureTrsRef)

  if (snapshot.empty) return

  const today = dayjs()

  try {
    let totalBalanceChange = 0
    const ledgerUpdates: Record<string, number> = {}
    let processedCount = 0
    const futureDeleteTxIds: string[] = []

    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, "users", currentUserUid)
      const userSnap = await transaction.get(userRef)

      if (!userSnap.exists()) return

      // Verify existence of future transactions inside the transaction to prevent double processing
      const futureTrRefs = snapshot.docs.map(d => doc(db, 'users', currentUserUid, 'futureTransactions', d.id))
      const futureTrSnaps = await Promise.all(futureTrRefs.map(ref => transaction.get(ref)))

      snapshot.docs.forEach((_, index) => {
        const docSnap = futureTrSnaps[index] // get the fresh snapshot from inside transaction

        if (!docSnap.exists()) return // Already processed by another client

        const tr = docSnap.data() as Transaction
        const trDate = dayjs(tr.date)

        // If still future, skip (re-check in case date changed? Unlikely but safe)
        if (trDate.isAfter(today, 'day')) return

        processedCount++

        // Mark as completed in main list
        const trRef = doc(db, "users", currentUserUid, "transactions", tr.id!)
        transaction.update(trRef, { hasTransactionCompleted: true })

        // Remove from future list
        transaction.delete(docSnap.ref)
        futureDeleteTxIds.push(docSnap.id)

        // Tally balance
        const isIncome = tr.type === TrType.Income
        totalBalanceChange += isIncome ? tr.baseAmount : -tr.baseAmount

        const currency = tr.currency.code
        const origAmt = isIncome ? tr.origAmount : -tr.origAmount
        ledgerUpdates[currency] = (ledgerUpdates[currency] || 0) + origAmt
      })

      if (processedCount === 0) return

      // Update user balance ONCE
      const updates: Record<string, number | ReturnType<typeof increment>> = {
        currentBalance: increment(totalBalanceChange)
      }
      for (const [curr, amt] of Object.entries(ledgerUpdates)) {
        updates[`balanceLedger.${curr}`] = increment(amt)
      }
      transaction.update(userRef, updates)
      // console.log(`Reconciled ${processedCount} future transactions.`)
    })

    // Local state update after successful transaction
    if (processedCount > 0) {
      updateCurrentBalance?.(totalBalanceChange)
      if (updateLedger) {
        for (const [curr, amt] of Object.entries(ledgerUpdates)) {
          updateLedger(curr, amt)
        }
      }
    }

    // Delete future transactions locally
    if (futureDeleteTxIds.length > 0) {
      futureDeleteTxIds.forEach(id => deleteFutureTransaction?.(id))
    }
  } catch (e) {
    console.error("Error reconciling future transactions:", e)
  }
}
