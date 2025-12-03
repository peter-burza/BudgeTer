import * as React from "react"
import { cn } from "@/lib/utils"

interface TextareaProps extends React.ComponentProps<"textarea"> {
  handleSetDescription: (value: string) => void
}

function Textarea({ className, handleSetDescription, ...props }: TextareaProps) {
  const { value } = props
  return (
    <textarea
      data-slot="textarea"
      value={value}
      onChange={(e) => {
        props.onChange?.(e)
        handleSetDescription(e.target.value)
      }}
      className={cn(
        "duration-200 text-[var(--background)] bg-[var(--foreground)] hover:shadow-[0_0_1.5px_1px_var(--foreground)]",
        "border-input placeholder:text-muted-foreground aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-lg  px-3 py-2 text-base outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
