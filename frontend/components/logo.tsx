import { cn } from "@/lib/utils"

type LogoProps = {
  className?: string
}

const Logo = ({ className }: LogoProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-px text-lg font-semibold tracking-tight",
        className
      )}
      aria-label="LearnHub"
    >
      <span className="text-foreground">Learn</span>
      <span className="text-amber-600 dark:text-amber-500">Hub</span>
    </span>
  )
}

export default Logo
