import { Currency } from "@/lib/types"
import { CURRENCIES } from "@/lib/constants"
import { User } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { create } from "zustand"
import { db } from "../../firebase"
import { useCurrencyStore } from "./CurrencyState"

interface SettingsState {
  // TODO:
  // Create some enum or something for the language too
  // lang: string,
  // setLang: (newLang: string) => void,

  setDefaultUserSettings: () => void,
  setUserSettings: (baseCurr: Currency, selectedCurr: Currency/*, lang: string*/) => void,

  fetchUserSettings: (currentUser: User | null) => void,
  hasFetchedUserSettings: boolean,
  setHasFetchedUserSettings: (val: boolean) => void
}


export const useSettingsStore = create<SettingsState>((set, get) => ({

  // lang: "en",
  // setLang: (newLang: string) => set({ lang: newLang }),

  hasFetchedUserSettings: false,
  setHasFetchedUserSettings: (val) => set({ hasFetchedUserSettings: val }),

  setDefaultUserSettings: () => {
    const { setSelectedCurrency, setBaseCurrency } = useCurrencyStore.getState()

    setBaseCurrency(CURRENCIES.EUR)
    setSelectedCurrency(CURRENCIES.EUR)
    // setLang('en')
  },

  setUserSettings: (baseCurr: Currency, selectedCurr: Currency/*, lang: string*/) => {
    const { setSelectedCurrency, setBaseCurrency } = useCurrencyStore.getState()
    setBaseCurrency(baseCurr)
    setSelectedCurrency(selectedCurr)
    // setLang(lang)
    // console.log(`Settings: (baseCurr = ${baseCurr.code}  |  selectedCurr = ${selectedCurr.code})`);
  },

  // Fetch/Set User App Settings 
  fetchUserSettings: async (currentUser: User | null) => { // this fetches all User App Settings
    const { setUserSettings/*, lang*/, hasFetchedUserSettings, setHasFetchedUserSettings } = get()
    const { selectedCurrency, baseCurrency } = useCurrencyStore.getState()

    if (!currentUser || hasFetchedUserSettings) return
    // first check if we already have any settings set
    try {
      const userDocRef = doc(db, "users", currentUser.uid)
      const userData = (await getDoc(userDocRef)).data()

      if (userData?.baseCurrency) {
        // User already have some settings — return them
        // console.log("Settings found:", userData)
        setUserSettings(userData.baseCurrency, userData.selectedCurrency/*, userData.lang*/)
      } else {
        // User doesn't have any settings — save them
        await setDoc(userDocRef, {
          baseCurrency: baseCurrency,
          selectedCurrency: selectedCurrency,
          // lang: lang,
        })

        // Local save
        // console.log("New settings saved")
        setUserSettings(baseCurrency, selectedCurrency/*, lang*/)
      }

    } catch (error: unknown) {
      if (error instanceof Error) { } // console.log(error.message)
    } finally {
      setHasFetchedUserSettings(true)
    }
  }
}))