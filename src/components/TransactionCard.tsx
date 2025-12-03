'use client'

import { ExpectingTransaction, Transaction } from "@/lib/interfaces"
import { Category } from '@/lib/enums'
import { TrType } from '@/lib/enums'
import { JSX } from "@emotion/react/jsx-runtime"
import React, { useState } from "react"
import Modal from "./Modal"
import { displayCategory, fancyNumber } from "@/lib"
import AccordionComp from "./ui/AccordionComp"

interface TransactionCardProps {
    value?: string | undefined
    screenWidth: number
    transaction: Transaction | ExpectingTransaction,
    setCategoryFilter: React.Dispatch<React.SetStateAction<Category | null>>
    deleteTransaction: (deleteTrId: string | undefined) => void
    iconDisabled?: boolean
    widthRatio?: {
        smalest: {
            hd_1: string,
            hd_2: string,
            hd_3: string,
            hd_4: string
        },
        sm: {
            hd_1: string,
            hd_2: string,
            hd_3: string,
            hd_4: string
        }
    }
}

function displayType(type: TrType): JSX.Element {
    if (type === TrType.Income) return <i className="fa-solid fa-angles-up"></i>
    return <i className="fa-solid fa-angles-down"></i>
}

const TransactionCard: React.FC<TransactionCardProps> = ({ value, screenWidth, transaction, setCategoryFilter, deleteTransaction, widthRatio, iconDisabled }) => {
    const cardStyle: string = transaction.type === TrType.Income 
    ? 'bg-[var(--color-list-bg-green)] !border-[var(--color-list-border-green)] text-green-100' 
    : 'bg-[var(--color-list-bg-red)] !border-[var(--color-list-border-red)] text-red-100'
    const [isExpanded, setIsExpanded] = useState<boolean>(false)
    const [deleteQuestion, setDeleteQuestion] = useState<boolean>(false)

    function parseWeight(ratio?: string | null) {
        if (!ratio) return 1
        const parts = ratio.split('/')
        const num = Number(parts[0])
        return Number.isFinite(num) ? num : 1
    }

    function getFlexStyle(smallRatio?: string, smRatio?: string) {
        const ratio = (screenWidth && screenWidth > 600) ? smRatio : smallRatio
        return { flex: parseWeight(ratio) }
    }

    function shortenDate(dateStr: string): string {
        if (screenWidth > 600) return dateStr
        const [year, month, day] = dateStr.split('-')

        const shortYear = year.slice(2) // "2025" → "25"
        const shortMonth = String(Number(month)) // "08" → 8
        const shortDay = String(Number(day))     // "05" → 5, "12" → 12

        return `${shortYear}-${shortMonth}-${shortDay}`
    }

    function toggleExpanded(): void {
        setIsExpanded(!isExpanded)
    }

    function toggleShowDeleteQ() {
        setDeleteQuestion(!deleteQuestion)
    }

    function deleteTr() {
        deleteTransaction(transaction.id)
        toggleShowDeleteQ()
        toggleExpanded()
    }


    return (
        <AccordionComp
            accordionTrigger={
                <>
                    <div style={getFlexStyle(widthRatio?.smalest?.hd_1, widthRatio?.sm?.hd_1)} className={`text-center !text-base`}>
                        {'date' in transaction ? shortenDate(transaction.date) : transaction.payDay}
                    </div>
                    <div style={getFlexStyle(widthRatio?.smalest?.hd_2, widthRatio?.sm?.hd_2)} className={`text-center !text-base`}>
                        {displayType(transaction.type)}
                    </div>
                    <div style={getFlexStyle(widthRatio?.smalest?.hd_3, widthRatio?.sm?.hd_3)} className={`text-center !text-base`}>
                        {fancyNumber(transaction.origAmount)}{" "}{transaction.currency.symbol}
                    </div>
                    <div style={getFlexStyle(widthRatio?.smalest?.hd_4, widthRatio?.sm?.hd_4)} className={`text-center category-cell !text-base`}
                        onClick={(e) => {
                            e.stopPropagation()
                            setCategoryFilter(transaction.category)
                        }}>
                        {displayCategory(transaction.category, screenWidth)}
                    </div>
                </>
            }
            accordionContent={
                <>
                    <Modal onClose={toggleShowDeleteQ} isOpen={deleteQuestion} onConfirm={deleteTr}>
                        <div className="flex flex-col gap-2 justify-center items-center">
                            <div className="flex flex-col items-center">
                                <p>Are you sure?</p>
                                <small>(This will delete the transaction permanently.)</small>
                            </div>
                            <div className="flex justify-evenly gap-1 w-full -mb-2.5">
                                <button onClick={deleteTr} className="primary-btn !p-0.75 items-center">
                                    <p className="px-2">Yes</p>
                                </button>
                                <button onClick={toggleShowDeleteQ} className="primary-btn !p-0.75 items-center">
                                    <p className="px-2">No</p>
                                </button>
                            </div>
                        </div>
                    </Modal>

                    <div className="flex py-2 gap-2 !border-none">
                        <div className="w-full min-w-0">
                            <p className="m-1.5 break-words !text-sm">{transaction.description !== '' ? transaction.description : 'No description...'}</p>
                        </div>
                        <button onClick={(e) => {
                            e.stopPropagation()
                            toggleShowDeleteQ()
                        }} className={`flex mx-1 my-auto py-1 h-fit justify-center items-center cursor-pointer duration-100 clickable`}>
                            <i className="fa-solid fa-trash-can text-red-300"></i>
                        </button>
                    </div>
                </>
            }
            value={value}
            className={`transaction-card border-1 border- ${cardStyle} clickable`}
            iconDisabled={iconDisabled}
        />
    )
}

export default TransactionCard