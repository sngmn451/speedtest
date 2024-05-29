import { useEffect, useState } from "react"

export function SpeedText ({ speed, isFinished = false }: {
  speed: number
  isFinished?: boolean
}) {
  if (speed <= 1000) {
    let random = Math.floor(Math.random()*1)
    return (
      <>
        <div className="text-center font-display text-6xl leading-none">
          {(speed+(isFinished?random:0)).toFixed(2)}
        </div>
        <div className="text-center text-md text-white/80">Kbps</div>
      </>
    )
  } else if (speed > 1000 && speed < 1000000) {
    let random = Math.floor(Math.random()*100)
    return (
      <>
        <div className="text-center font-display text-6xl leading-none">
          {((speed+(isFinished?random:0))/1000).toFixed(2)}
        </div>
        <div className="text-center text-md text-white/80">Mbps</div>
      </>
    )
  } else {
    let random = Math.floor(Math.random()*100000)
    
    return (
      <>
        <div className="text-center font-display text-6xl leading-none">
          {new Intl.NumberFormat("en-US", {
            maximumFractionDigits: 2
          }).format((speed+(isFinished?0:random))/1000/1000)}
        </div>
        <div className="text-center text-md text-white/80">Gbps</div>
      </>
    )
  }
}


export function SpeedTestingText () {
  const [dot, setDot] = useState<string>(".")
  useEffect(() => {
    const interval = setInterval(() => {
      setDot(d => {
        if (d.length < 3) {
          return d + "."
        } else {
          return "."
        }
      })
    }, 200)
    return () => {
      clearInterval(interval)
    }
  }, [])
  return (
    <div className="w-14">Testing{dot}</div>
  )
}
