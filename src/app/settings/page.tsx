'use client'

import ExpTransactions from "@/components/ExpTransactions"
import CurrencySelector from "@/components/ui/CurrencySelector"
import { useAuth } from "@/context/AuthContext"


const SettingsPage = () => {
    const { currentUser, isLoadingUser } = useAuth()

    if (isLoadingUser) {
        return <h6 className="">Loading User...</h6>;
    }

    if (!currentUser) {
        // if no user found - then boot them to the home page cause the settings page is for authenticated users only
        window.location.href = "/";
    }

    return (
        <>
            <div id="settings" className="base-container">
                <h3>App Settings</h3>

                <div className="flex flex-col gap-1 w-fit">
                    <p>Select Currency:</p>
                    <CurrencySelector />
                </div>

                <hr className="text-[var(--color-dark-blue)] w-[85%] mb-3 mt-4" />

                <h4 className="text-center pb-2">Expecting Transactions</h4>
                <ExpTransactions />
            </div>
        </>
    )
}

export default SettingsPage