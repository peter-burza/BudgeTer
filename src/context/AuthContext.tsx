'use client'

import {
  createContext,
  useContext,
  useState,
  ReactNode
} from 'react'
import { useSettingsStore } from './SettingsState'

// Mock User type (simplified)
interface MockUser {
  uid: string
  email: string
  displayName: string
  photoURL: string | null
}

// Define the shape of the context
interface AuthContextType {
  currentUser: MockUser | null
  isLoadingUser: boolean
  isLoggedIn: boolean
  signInWithGoogle: () => Promise<void>
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

// Mock user for testing (Firebase disabled)
const MOCK_USER: MockUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null
}

// Provider component
export default function AuthProvider({ children }: AuthProviderProps) {
  const setHasFetchedUserSettings = useSettingsStore(state => state.setHasFetchedUserSettings)

  // Always logged in with mock user (Firebase disabled)
  const [currentUser, setCurrentUser] = useState<MockUser | null>(MOCK_USER)
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(false)
  const [firstLogin, setFirstLogin] = useState<boolean>(false)

  const isLoggedIn = currentUser ? true : false

  const signInWithGoogle = async () => {
    // Mock sign in - no Firebase call
    console.log('Mock sign in (Firebase disabled)')
    setCurrentUser(MOCK_USER)
  }

  const logout = async () => {
    // Mock logout
    setCurrentUser(null)
    setHasFetchedUserSettings(false)
    console.log('Mock logout (Firebase disabled)')
  }

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
