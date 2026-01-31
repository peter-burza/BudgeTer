/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import React, { useMemo, useState, useEffect, JSX } from 'react'
import ResponsiveHeader from './ui/ResponsiveHeader'
import Modal from './Modal'

/**
 * Configuration for a single column in the table
 */
export interface ColumnConfig {
    /** Unique identifier for the column */
    id: string
    /** Display label for the column header */
    label: string
    /** Font Awesome icon class for the header */
    iconClass: string
    /** Width ratio for small screens (e.g., "4/18") */
    smallRatio: string
    /** Width ratio for larger screens (e.g., "2/18") */
    largeRatio: string
    /** Whether this column can be sorted */
    sortable?: boolean
    /** Function to sort data ascending */
    sortAscending?: (data: any[]) => any[]
    /** Function to sort data descending */
    sortDescending?: (data: any[]) => any[]
    /** Whether this column can filter type (Income/Expense) */
    isTypeFilter?: boolean
    /** Whether this column can filter by category */
    isCategoryFilter?: boolean
    /** Click handler for the column header */
    onHeaderClick?: () => void
    /** Custom styling for the column header */
    headerClassName?: string
    /** is column clickable? */
    clickable?: boolean
}

/**
 * Props for the GenericTable component
 */
export interface GenericTableProps<T> {
    /** Array of data items to display */
    data: T[]
    /** Array of column configurations */
    columns: ColumnConfig[]
    /** Function to render a single row */
    renderRow: (item: T, index: number, screenWidth: number) => JSX.Element
    /** Title of the table */
    title: string
    /** Current screen width for responsive behavior */
    screenWidth: number
    /** Whether the table is in a loading state */
    isLoading?: boolean
    /** Empty state message when no items match filters */
    emptyFilterMessage?: string
    /** Empty state message when no items exist at all */
    emptyDataMessage?: string
    /** Whether to show pagination controls */
    showPagination?: boolean
    /** Initial number of items to display */
    initialItemCount?: number
    /** Increment for pagination */
    paginationStep?: number
    /** Show help/info modal */
    showHelpModal?: boolean
    /** Custom info modal content */
    infoModalContent?: JSX.Element
    /** Callback when item count changes (for pagination) */
    onItemCountChange?: (count: number) => void
    /** If the content will be accordions */
    extraRightPadding?: boolean
}

/**
 * A generic, reusable table component for displaying lists of data with:
 * - Sorting by multiple columns
 * - Filtering capabilities
 * - Responsive column widths
 * - Pagination/expansion controls
 * - Customizable rendering per row
 */
const GenericTable = React.forwardRef<HTMLDivElement, GenericTableProps<any>>(
    (
        {
            data,
            columns,
            renderRow,
            title,
            screenWidth,
            isLoading = false,
            emptyFilterMessage = 'No items for selected filter.',
            emptyDataMessage = 'No items detected.',
            showPagination = true,
            initialItemCount = 10,
            paginationStep = 10,
            showHelpModal = false,
            infoModalContent,
            onItemCountChange,
            extraRightPadding = true,
        },
        ref
    ) => {
        const [sortingColumnId, setSortingColumnId] = useState<string | null>(null)
        const [sortingAscending, setSortingAscending] = useState<boolean | null>(null)
        const [itemCount, setItemCount] = useState<number>(initialItemCount)
        const [showInfo, setShowInfo] = useState<boolean>(showHelpModal)

        // Helper function to parse flex ratio
        function parseWeight(ratio?: string | null): number {
            if (!ratio) return 1
            const parts = ratio.split('/')
            const num = Number(parts[0])
            return Number.isFinite(num) ? num : 1
        }

        // Get flex style based on screen width
        function getFlexStyle(smallRatio?: string, largeRatio?: string) {
            const ratio = screenWidth > 600 ? largeRatio : smallRatio
            return { flex: parseWeight(ratio) }
        }

        // Handle header click for sorting
        function handleHeaderClick(column: ColumnConfig) {
            if (column.onHeaderClick) {
                column.onHeaderClick()
            }
            // Toggle sorting for sortable columns
            if (column.sortable && column.id) {
                if (sortingColumnId === column.id) {
                    // Toggle sort direction
                    setSortingAscending((prev) => (prev === false ? true : false))
                } else {
                    // Switch to this column, default to descending
                    setSortingColumnId(column.id)
                    setSortingAscending(false)
                }
            }
        }

        // Apply sorting to data
        const sortedData = useMemo(() => {
            if (!sortingColumnId) return data

            const column = columns.find(c => c.id === sortingColumnId)
            if (!column || !column.sortable) return data

            if (sortingAscending === true && column.sortAscending) {
                return column.sortAscending([...data])
            } else if (sortingAscending === false && column.sortDescending) {
                return column.sortDescending([...data])
            }

            return data
        }, [data, sortingColumnId, sortingAscending, columns])

        // Render sorting icon based on state
        function renderSortingIcon(columnId: string): JSX.Element {
            if (sortingColumnId !== columnId) {
                return <i className="fa-solid fa-angle-down text-xs text-[var(--foreground)] duration-200"></i>
            }
            if (sortingAscending === false) {
                return <i className="fa-solid fa-angle-down text-xs text-blue-300 duration-200"></i>
            }
            return <i className="fa-solid fa-angle-down text-xs text-blue-300 rotate-180 duration-200"></i>
        }

        // Handle pagination
        function handleExpandClick() {
            const newCount = itemCount + paginationStep
            setItemCount(newCount)
            onItemCountChange?.(newCount)
        }

        function handleShortenClick() {
            const newCount = Math.max(initialItemCount, itemCount - paginationStep)
            setItemCount(newCount)
            onItemCountChange?.(newCount)
        }

        function toggleShowInfo() {
            setShowInfo(!showInfo)
        }

        return (
            <div ref={ref} id="generic-table" className="flex flex-col w-full items-center gap-4">
                {/* Info Modal */}
                <Modal onClose={toggleShowInfo} isOpen={showInfo}>
                    {infoModalContent}
                </Modal>

                {/* Table Title */}
                <div className="flex gap-2 items-center">
                    <h5>{title}</h5>
                    {infoModalContent &&
                        <i
                            onClick={toggleShowInfo}
                            className="fa-solid fa-circle-info clickable duration-200 text-sky-300"
                        ></i>
                    }
                </div>

                {/* Table Container */}
                <div className="w-full flex flex-col gap-1">
                    {/* Table Header */}
                    <div className={`thead font-bold w-full px-3 py-2.5 ${extraRightPadding ? 'pr-9' : ''} flex gap-2 border border-[var(--color-dark-blue)] rounded-lg bg-sky-800`}>
                        {columns.map((column) => (
                            <div
                                key={column.id}
                                onClick={() => handleHeaderClick(column)}
                                style={getFlexStyle(column.smallRatio, column.largeRatio)}
                                className={`text-center ${column.clickable && 'clickable'} ${column.headerClassName || ''
                                    }`}
                            >
                                <div className="flex flex-row items-center justify-center gap-1">
                                    <ResponsiveHeader
                                        label={column.label}
                                        iconClass={column.iconClass}
                                        screenWidth={screenWidth}
                                    />
                                    {column.sortable && renderSortingIcon(column.id)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Table Body */}
                    <div className={`tbody flex flex-col gap-0.5 ${isLoading && 'opacity-50 duration-200'}`}>
                        {sortedData.length > 0 ? (
                            sortedData.slice(0, itemCount).map((item, idx) => renderRow(item, idx, screenWidth))
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-gray-400">
                                    {data.length > 0 ? emptyFilterMessage : emptyDataMessage}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pagination Controls */}
                {showPagination && sortedData.length > initialItemCount && (
                    <div className="relative flex gap-4 w-full justify-center">
                        <button
                            onClick={handleExpandClick}
                            className="expand-shorten-btn"
                            disabled={itemCount >= sortedData.length}
                        >
                            <h4>
                                <i className="fa-solid fa-arrow-down-long"></i>
                            </h4>
                        </button>
                        <button
                            onClick={handleShortenClick}
                            className="expand-shorten-btn"
                            disabled={itemCount <= initialItemCount}
                        >
                            <h4>
                                <i className="fa-solid fa-arrow-up-long"></i>
                            </h4>
                        </button>
                        <p className='absolute right-1 !text-sm'>{itemCount > sortedData.length ? sortedData.length : itemCount}/{sortedData.length}</p>
                    </div>
                )}
            </div>
        )
    }
)

GenericTable.displayName = 'GenericTable'

export default GenericTable
