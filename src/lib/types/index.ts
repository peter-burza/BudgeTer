import { Category } from "../enums"

export type Currency = {
  code: string
  symbol: string
  name: string
}

export type Rates = Record<string, number>

export type CategorySummary = {
  category: Category
  total: number
  percentage: number
  currency: Currency
}

export type BalanceLedger = Record<string, number>