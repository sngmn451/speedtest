
interface Props {
  title: string
  description: string
}

export function SpeedCard ({ title, description }: Props) {
  return (
    <div className="flex flex-row items-center justify-center gap-2 text-white/50">
      <span className="text-sm font-medium">{title}</span>
      <span className="text-xs">{description}</span>
    </div>
  )
}
