import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/src/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const variants = {
      default: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 px-4 py-2 rounded-xl h-10 flex items-center justify-center font-medium transition-all active:scale-95",
      destructive: "bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-xl h-10 flex items-center justify-center font-medium transition-all animate-in fade-in zoom-in",
      outline: "border border-slate-700 text-slate-300 hover:bg-slate-800 px-4 py-2 rounded-xl h-10 flex items-center justify-center font-medium transition-all",
      secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700 px-4 py-2 rounded-xl h-10 flex items-center justify-center font-medium transition-all",
      ghost: "text-slate-400 hover:text-white hover:bg-white/10 px-4 py-2 rounded-xl h-10 flex items-center justify-center font-medium transition-all",
      link: "text-indigo-400 underline-offset-4 hover:underline",
    }

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-lg px-3",
      lg: "h-12 rounded-2xl px-8 text-lg",
      icon: "h-10 w-10",
    }

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap text-sm disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
