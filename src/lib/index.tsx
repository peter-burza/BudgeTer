import { JSX } from "@emotion/react/jsx-runtime"
import { ExpectingTransaction, Transaction } from "./interfaces"
import { Rates } from "./types"
import { Category } from "@/lib/enums"
import dayjs from "dayjs"
import { arrayUnion, doc, setDoc, updateDoc } from "firebase/firestore"
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

export function handleToggle(x: boolean, setX: React.Dispatch<React.SetStateAction<boolean>>): void {
  setX(!x)
}

export function roundToTwo(num: number): number {
  return Math.round(num * 100) / 100
}

function getArrayType(arr: (Transaction | ExpectingTransaction)[]): 'transaction' | 'expecting' | 'unknown' {
  if (arr.length === 0) return 'unknown'
  const item = arr[0]

  if ('date' in item) return 'transaction'
  if ('startDate' in item) return 'expecting'
  return 'unknown'
}


export function areTransactionSetsEqual(arr1: Transaction[] | ExpectingTransaction[], arr2: Transaction[] | ExpectingTransaction[]): boolean {
  const type1 = getArrayType(arr1)
  const type2 = getArrayType(arr2)
  if (type1 !== type2 || arr1.length !== arr2.length) return false

  const sortById = (a: Transaction | ExpectingTransaction, b: Transaction | ExpectingTransaction) => a.id!.localeCompare(b.id!)

  const sorted1 = [...arr1].sort(sortById)
  const sorted2 = [...arr2].sort(sortById)

  if (type1 === 'transaction') {
    return sorted1.every((t1, index) => {
      const tr1 = t1 as Transaction
      const tr2 = sorted2[index] as Transaction
      return (
        tr1.id === tr2.id &&
        tr1.baseAmount === tr2.baseAmount &&
        tr1.type === tr2.type &&
        tr1.date === tr2.date &&
        tr1.category === tr2.category &&
        (tr1.description || '') === (tr2.description || '')
      )
    })
  }

  return sorted1.every((t1, index) => {
    const tr1 = t1 as ExpectingTransaction
    const tr2 = sorted2[index] as ExpectingTransaction
    return (
      tr1.id === tr2.id &&
      tr1.baseAmount === tr2.baseAmount &&
      tr1.type === tr2.type &&
      tr1.payDay === tr2.payDay &&
      tr1.startDate === tr2.startDate &&
      tr1.category === tr2.category &&
      (tr1.description || '') === (tr2.description || '')
    )
  })
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
  setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>,
  setTransactions?: (updater: (prev: Transaction[]) => Transaction[]) => void
): Promise<void> {
  if (!newTr.id || !newTr.baseAmount) return

  try {
    setIsLoading?.(true)

    const trRef = doc(db, 'users', currentUserUid, 'transactions', newTr.id)
    await setDoc(trRef, newTr)

    setTransactions?.((prev) => [...prev, newTr])
    console.log(`Transaction (id: ${newTr.id}) saved successfully`)
  } catch (error: unknown) {
    if (error instanceof Error) console.log(error.message)
  } finally {
    setIsLoading?.(false)
  }
}

export function getMissingMonthsForExpTr(
  startDate: string,
  processedMonths: Set<string>
): string[] {

  const start = dayjs(startDate).startOf('month')
  const end = dayjs().subtract(1, 'month').startOf('month') // 👈 previous month

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
    console.log(`Updated ${fieldKey} in expTransaction ${transactionId}`)
  } catch (error) {
    console.error("Error updating expTransaction:", error)
  }
}

export async function processExpTransactions(
  expTransactions: ExpectingTransaction[],
  currentUser: User | null,
  setTransactions: (updater: (prev: Transaction[]) => Transaction[]) => void,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  rates: Rates
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
            exchangeRate: rates[expTr.currency.code]
          },
          currentUser.uid,
          setIsLoading,
          setTransactions
        )
        // Add month to the processedMonths array
        if (expTr.id) {
          updateExpTransactionField(currentUser.uid, expTr.id, 'processedMonths', month)
          expTr.processedMonths.push(month)
          console.log(month + ' added to processedMonths for expTr (' + expTr.id + ')')
        } else console.log('expTr.id is not available')
      })
      console.log('expTr (' + expTr.id + ') has been processed for: ' + unprocessedMonths)
    }
    // else {
    //   console.log('expTr (' + expTr.id + ') has no unprocessed months');
    // }

    //check if tr has to be processed this month
    if (currentDayOfMonth >= expTr.payDay && !processedMonths.has(getCurrentDate('YYYY-MM'))) {
      console.log(processedMonths)
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
          exchangeRate: rates[expTr.currency.code]
        },
        currentUser.uid,
        setIsLoading,
        setTransactions
      )
      // Add month to the processedMonths array
      if (expTr.id) {
        updateExpTransactionField(currentUser.uid, expTr.id, 'processedMonths', currentMonth)
        expTr.processedMonths.push(currentMonth)
        console.log(currentMonth + ' added to processedMonths for expTr (' + expTr.id + ')')
      } else console.log('expTr.id is not available')
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
