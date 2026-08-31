import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type ShowStatusBadgeProps = {
  status: string
  className?: string
}

export function ShowStatusBadge({ status, className }: ShowStatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'netflix-pill text-muted-foreground bg-white/10 text-[0.65rem] font-semibold tracking-wide uppercase hover:bg-white/10',
        className,
      )}
    >
      {status}
    </Badge>
  )
}
