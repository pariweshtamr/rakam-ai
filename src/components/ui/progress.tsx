"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

type ProgressProps = React.ComponentProps<typeof ProgressPrimitive.Root> & {
  extraStyles: string
}

import { cn } from "@/lib/utils"

function Progress({ className, value, extraStyles, ...props }: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "bg-primary h-full w-full flex-1 transition-all",
          extraStyles
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
