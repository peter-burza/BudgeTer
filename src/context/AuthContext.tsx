'use client'

import { auth } from '../../firebase'

import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
  UserCredential,
  getAdditionalUserInfo
} from 'firebase/auth'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react'
import { useSettingsStore } from './SettingsState'

// Define the shape of the context
interface AuthContextType {
  currentUser: User | null
  isLoadingUser: boolean
  isLoggedIn: boolean
  signInWithGoogle: () => Promise<UserCredential>
  logout: () => Promise<void>
  firstLogin: boolean
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hook to use the context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Props for the provider
interface AuthProviderProps {
  children: ReactNode
}

// Provider component
export default function AuthProvider({ children }: AuthProviderProps) {
  const setHasFetchedUserSettings = useSettingsStore(state => state.setHasFetchedUserSettings)

  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true)
  const [firstLogin, setFirstLogin] = useState<boolean>(false)

  const isLoggedIn = currentUser ? true : false

  const signInWithGoogle = async () => {
    setIsLoadingUser(true)
    const provider = await new GoogleAuthProvider()

    // Always show the "choose an account" popup
    provider.setCustomParameters({
      prompt: 'select_account'
    })

    const result = await signInWithPopup(auth, provider)

    const isNewUser = getAdditionalUserInfo(result)?.isNewUser ?? false
    
    // First time logged in
    if (isNewUser) {
      setFirstLogin(true)
    }

    setIsLoadingUser(false)
    return result
  }

  const logout = async () => {
    setCurrentUser(null)
    setHasFetchedUserSettings(false)

    return await signOut(auth)
  }


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // console.log('Authenticating user...')
      setIsLoadingUser(true)
      try {
        setCurrentUser(user)
        if (!user) throw new Error('No user found')
        console.log('Found user')
      } catch (error: unknown) {
        if (error instanceof Error) console.log(error.message)
      } finally {
        setIsLoadingUser(false)
      }
    })

    return unsubscribe
  }, [])

  const value: AuthContextType = {
    currentUser,
    isLoadingUser,
    isLoggedIn,
    signInWithGoogle,
    logout,
    firstLogin
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
