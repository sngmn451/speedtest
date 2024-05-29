
interface Props {
  title: string
  description?: string
}

export function SpeedCard ({ title, description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center border rounded-md p-2">
      <h5 className="text-sm">{title}</h5>
      {description && <p className="text-xs">{description}</p>}
    </div>
  )
}
