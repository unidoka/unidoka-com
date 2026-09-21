import { cn } from "@/lib/utils"

export function Container({ variant = 'default', className, ...props }: React.ComponentProps<"div"> & { variant?: 'default' | 'full-width' }) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-0",
        variant === 'default' && "sm:max-w-[600px] md:max-w-[740px] lg:max-w-[1000px] xl:max-w-[1200px] 2xl:max-w-[1500px]",
        variant === 'full-width' && "sm:px-6 lg:px-8 xl:px-12",
        className
      )}
      {...props}
    />
  )
}
