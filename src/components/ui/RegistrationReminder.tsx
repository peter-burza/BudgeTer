'use client'

import { useEffect, useState } from 'react'
import Modal from '../Modal'
import { useAuth } from '@/context/AuthContext'
import { Transaction } from '@/lib/interfaces'

interface RegistrationReminderProps {
    isUserLoggedIn: boolean
    transactions: Transaction[]
}

const RegistrationReminder: React.FC<RegistrationReminderProps> = ({ isUserLoggedIn, transactions }) => {
    const { signInWithGoogle } = useAuth()
    const [isRemindMsgShowed, setIsRemindMsgShowed] = useState<boolean>(false)

    function registerAndClose() {
        signInWithGoogle()
        setIsRemindMsgShowed(false)
    }

    useEffect(() => {
        if (isUserLoggedIn || transactions.length <= 0) {
            setIsRemindMsgShowed(false)
            return
        }

        if (transactions.length >= 5) {
            setIsRemindMsgShowed(true)
        }

        // Set a timer for 5 minutes
        const timer = setTimeout(() => {
            setIsRemindMsgShowed(true)
        }, 5 * 60 * 1000)
        console.log('Timer was started');
        
        // Cleanup if the component unmounts before 5 min
        return () => clearTimeout(timer)
    }, [isUserLoggedIn, transactions])

    return (
        <Modal isOpen={isRemindMsgShowed} onClose={() => setIsRemindMsgShowed(false)}>
            <h3>Don&apos;t lose your data!</h3>
            <p className='max-w-130'>To prevent losing your saved transactions, just sign up <button onClick={registerAndClose}><i className='text-sky-300 clickable'>here</i></button>, or click the &quot;<i>Sign in with Google</i>&quot; button to save your data permanently.</p>
        </Modal>
    )
}

export default RegistrationReminder