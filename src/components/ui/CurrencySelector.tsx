'use client'

import { CURRENCIES } from "@/utils/constants"
import React from 'react'
import { db } from '../../../firebase'
import { useAuth } from '@/context/AuthContext'
import { doc, updateDoc } from 'firebase/firestore'
import { useCurrencyStore } from '@/context/CurrencyState'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ShadcnComponents/select"

const CurrencySelector: React.FC = () => {
    const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency)
    const setSelectedCurrency = useCurrencyStore((state) => state.setSelectedCurrency)
    const { currentUser } = useAuth()

    async function setCurrency(selectedCurrCode: string): Promise<void> {
        //db save
        if (currentUser) {
            const userRef = doc(db, 'users', currentUser.uid)
            updateDoc(userRef, {
                selectedCurrency: CURRENCIES[selectedCurrCode]
            })
        }
        // local save
        setSelectedCurrency(CURRENCIES[selectedCurrCode]);
        // console.log('Currency changed');

    }


    return (
        <Select
            value={selectedCurrency.code}
            onValueChange={(val: string) => setCurrency(val)}
        >
            <SelectTrigger>
                <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
                {Object.values(CURRENCIES).map((currency, idx) => (
                    <SelectItem
                        key={idx}
                        value={currency.code}
                        title={`${currency.code}  -  ${currency.name}  -  ${currency.symbol}`}
                    >
                        {currency.code}  -  {currency.name}  -  &#91;{currency.symbol}&#93;
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

export default CurrencySelector
