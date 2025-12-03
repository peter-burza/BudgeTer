import { displayCategory, fancyNumber } from "@/lib"
import { CategorySummary } from "@/lib/types"

interface ExpenseBreakdownCardProps {
    screenWidth: number
    categorySummary: CategorySummary
    widthRatio?: {
        smalest: {
            hd_1: string,
            hd_2: string,
            hd_3: string
        },
        sm: {
            hd_1: string,
            hd_2: string,
            hd_3: string
        }
    }
}

const ExpenseBreakdownCard: React.FC<ExpenseBreakdownCardProps> = ({ screenWidth, categorySummary, widthRatio }) => {

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

    return (
        <div className="flex gap-2 px-3 py-1 my-0.5 w-full bg-[var(--color-list-bg-red)] border !border-[var(--color-list-border-red)] text-red-100 rounded-lg">
            <div style={getFlexStyle(widthRatio?.smalest?.hd_1, widthRatio?.sm?.hd_1)} className="text-center !text-base" >{displayCategory(categorySummary.category, screenWidth)}</div>
            <div style={getFlexStyle(widthRatio?.smalest?.hd_2, widthRatio?.sm?.hd_2)} className="text-center !text-base" >{fancyNumber(categorySummary.total)} {categorySummary.currency.symbol}</div>
            <div style={getFlexStyle(widthRatio?.smalest?.hd_3, widthRatio?.sm?.hd_3)} className="text-center !text-base" >{categorySummary.percentage.toFixed(1)}%</div>
        </div>
    )
}

export default ExpenseBreakdownCard