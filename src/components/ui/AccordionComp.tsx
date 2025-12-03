import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/ShadcnComponents/accordion"
import { JSX } from "react"

interface AccordionCompProps {
    accordionTrigger: JSX.Element
    accordionContent: JSX.Element
    value?: string
    className?: string
    iconDisabled?: boolean
}

const AccordionComp: React.FC<AccordionCompProps> = ({ accordionTrigger, accordionContent, value, className, iconDisabled }) => {
    const defaultValue = 'item-1'

    return (
        <div>
            <Accordion type="single" collapsible className={`${className} rounded-lg my-0.5`}>
                <AccordionItem value={value ?? defaultValue}>
                    <AccordionTrigger className="px-3 py-1 gap-2 clickable" iconDisabled={iconDisabled ? true : false}>{accordionTrigger}</AccordionTrigger>
                    {!iconDisabled && <AccordionContent className="px-3 text-base">
                        <hr className="m-auto text-[var(--border)]" />
                        {accordionContent}
                    </AccordionContent>}
                </AccordionItem>
            </Accordion>
        </div>
    )
}

export default AccordionComp