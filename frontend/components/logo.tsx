import { cn } from "@/lib/utils"

type LogoProps = {
  className?: string
}

const Logo = ({ className }: LogoProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-px text-3xl font-bold tracking-tight",
        className
      )}
      aria-label="LearnHub"
    >
      <span className="bg-gradient-to-b from-foreground to-foreground/25 bg-clip-text text-transparent">
        Learn
      </span>
      <span className="bg-gradient-to-b from-amber-600 to-amber-500/30 bg-clip-text text-transparent">
        Hub
      </span>
    </span>
  )
}

export default Logo
