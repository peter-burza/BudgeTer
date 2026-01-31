import { create } from 'zustand'
import { Currency, Rates } from '@/lib/types'
import { CURRENCIES } from "@/lib/constants"


interface CurrencyState {
  baseCurrency: Currency
  setBaseCurrency: (currency: Currency) => void
  selectedCurrency: Currency
  setSelectedCurrency: (newCurr: Currency) => void
  rates: Rates
  lastRatesFetch: number
  setLastRatesFetch: (newTime: number) => void
  fetchRates: () => Promise<void>
  convert: (amountInBaseCurr: number, currency: number) => number
  convertGlobalFunc: (from: string, to: string, amount: number, date?: string) => Promise<number>
}

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  baseCurrency: CURRENCIES.EUR,
  setBaseCurrency: (currency) => set({ baseCurrency: currency }),

  selectedCurrency: CURRENCIES.EUR,
  setSelectedCurrency: (newCurr: Currency) => {
    set({ selectedCurrency: newCurr })
  },

  rates: { "EUR": 1 },
  lastRatesFetch: 0,
  setLastRatesFetch: (newTimestamp) => set({ lastRatesFetch: newTimestamp }),

  fetchRates: async () => {
    const { setLastRatesFetch, lastRatesFetch } = get()
    const oneDayInMs = 24 * 60 * 60 * 1000
    if (Date.now() < lastRatesFetch + oneDayInMs) return

    try {
      const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=${get().baseCurrency.code}`)
      const data = await res.json()

      set({ rates: data.rates })
      setLastRatesFetch(Date.now())
      // console.log('Exchange rates fetched from Frankfurter')
    } catch (error) {
      console.error('Failed to fetch rates', error)
    }
  },

  convert: (amountInBaseCurr, rate) => {
    return amountInBaseCurr * rate
  },

  convertGlobalFunc: async (from, to, amount, date): Promise<number> => {
    const endpoint = `https://api.frankfurter.dev/v1/${date || 'latest'}?base=${from}&symbols=${to}`
    try {
      const response = await fetch(endpoint)
      const data = await response.json()

      if (!data.rates || !data.rates[to]) {
        throw new Error(`Rate for ${to} not found`)
      }

      const convertedAmount = amount * data.rates[to]
      // console.log(' = ' + Math.round(convertedAmount * 100) / 100)

      return convertedAmount
    } catch (error) {
      console.error('Conversion failed:', error)
      return 10
    }
  }


}))
