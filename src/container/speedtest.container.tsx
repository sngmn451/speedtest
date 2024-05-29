import { SpeedCard } from "@/components/speed/card"
import { SpeedIndicator } from "@/components/speed/indicator"
import { SpeedTestingText, SpeedText } from "@/components/speed/text"
import { xhr } from "@/lib/xhr"
import { useState } from "react"

export function SpeedTestContainer () {
  const [pingms, setPingms] = useState<number>(0)
  const [location, setLocation] = useState<string>("")
  const [ip, setIp] = useState<string>("")
  const [downloadSpeed, setDownloadSpeed] = useState<number[]>([])
  const [downloadLossCount, setDownloadLossCount] = useState<number>(0)
  const [downloadErrorCount, setDownloadErrorCount] = useState<number>(0)
  const [speedTestState, setSpeedTestState] = useState<"INIT" | "TESTING" | "FINISH">("INIT")
  // const [uploadSpeed, setUploadSpeed] = useState<number[]>([])
  async function onClick () {
    const url = {
      info: `https://ip-info.apthlabs.workers.dev`,
      ipv4: `https://api.ipify.org/?format=json`
    }
    const MAX_ROUNDS = 512
    const MAX_TIME_PER_REQUEST_IN_MS = 200
    const MAX_TIME_FETCH_IN_MS = 200
    let round = 0
    let lastFetchTime: number = 0
    setSpeedTestState("TESTING")
    const { country, city } = await (await fetch(url.info)).json() as {
      country: string
      city: string
    }
    setLocation(`${city}, ${country}`)
    const { ip } = await (await fetch(url.ipv4)).json() as {
      ip: string
    }
    setIp(ip)
    while (round < MAX_ROUNDS) {
      const downloadSpeed = await DownloadSpeedTest(round, MAX_TIME_PER_REQUEST_IN_MS)
      if (downloadSpeed.timeout) {
        setDownloadErrorCount(downloadErrorCount + 1)
      }
      if (downloadSpeed.error) {
        setDownloadLossCount(downloadLossCount + 1)
      }
      if (downloadSpeed.success) {
        lastFetchTime = downloadSpeed.time!
        setDownloadSpeed(cur => [
          ...cur,
          downloadSpeed.speed || 0
        ])
        if (round === 1) {
          setPingms(downloadSpeed.ping!)
        }
      }
      round = round + 1
      if (lastFetchTime >= MAX_TIME_FETCH_IN_MS) {
        setSpeedTestState("FINISH")
        break
      }
    }
    setSpeedTestState("FINISH")
  }
  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="mx-auto max-w-screen-sm w-full">
        <div className="grid grid-cols-3 gap-4">
          <SpeedCard title="Ping" description={`${downloadSpeed.length > 0 ? `${Math.floor(pingms)} ms` : "-"}`} />
          <SpeedCard title="Lost" description={String(downloadSpeed.length > 0 ? `${(downloadLossCount/downloadSpeed.length).toFixed(2)}%` : "-")} />
          <SpeedCard title="Error" description={String(downloadSpeed.length > 0 ? `${(downloadErrorCount/downloadSpeed.length).toFixed(2)}%` : "-")} />
        </div>
      </div>
      <div className="flex-1" />
      <div className="flex flex-col items-center justify-center gap-4">
        {speedTestState === "INIT" && <div className="text-center font-display text-3xl">
        ⚡ Speed test ⚡
        </div>}
        {speedTestState !== "INIT" && <div className="relative">
          <SpeedIndicator/>
          <div className="absolute w-full h-full inset-0 flex flex-col items-center justify-center pt-24 gap-2">
            <div>
              {downloadSpeed.length > 0 && (speedTestState === "TESTING" ? <SpeedText speed={downloadSpeed[downloadSpeed.length-1]} isFinished={false}/> : <SpeedText speed={downloadSpeed.sort((a, b) => b - a).at(0)!} isFinished={true} />)}
            </div>
            <div className="text-center">
              <div className="text-xs text-white/67">{location}</div>
              <div className="text-[8px] text-white/50">{ip}</div>
            </div>
          </div>
        </div>}
        {speedTestState === "TESTING" && 
          <SpeedTestingText />
        }
        {speedTestState == "INIT" && <button className="w-24 h-24 border rounded-full shadow-primary shadow-lg hover:shadow-accent" onClick={onClick}>Start</button>}
        {speedTestState === "FINISH" && <button className="px-3 py-2 border rounded-full leading-none" onClick={() => {
          setPingms(0)
          setDownloadSpeed([])
          setSpeedTestState("INIT")
        }}>Retry</button>}
      </div>
      <div className="flex-1" />
    </div>
  )
}



const url = {
  download: "/api/speed-test/download",
  upload: "/api/speed-test/upload"
}
/**
 * Test download speed of a file with specific size within ttl, request over ttl will return 408 error, error will return Http error, otherwise it will return the speed in Mb/s
 * @param size in Bytes
 * @param ttl in ms
 */
async function DownloadSpeedTest (round: number, ttl: number): Promise<{
  success: boolean
  speed?: number
  ping?: number
  time?: number
  error?: boolean
  timeout?: boolean
}> {
  let error = false
  let timeout = false
  let speed = 0
  
  const now = performance.now()
  let response
  try {
    response = await xhr(`${url.download}?index=${round}&t=${new Date().getTime()}`, { ttl })

    if (response.success === false) {
      return {
        success: false,
        error: response.status !== 408,
        timeout: response.status === 408
      }
    }
    const fetchDuration = Math.floor(performance.now() - now) // in ms
    const fileSizeInBytes = Number(response.headers!["content-length"])
    const fileSizeInBits = fileSizeInBytes*8
    const ApiTime = Number(response.headers!["x-api-time"])
    const downloadTimeInMs = (fetchDuration - ApiTime)
  
    speed = fileSizeInBits / downloadTimeInMs // in Mb/s
    return {
      success: true,
      speed,
      ping: response.ping,
      time: downloadTimeInMs,
      error,
      timeout
    }  
  } catch {
    return {
      success: false,
      error: true
    }
  }
}
/**
 * WIP
 */
async function UploadSpeedTest () {
  // const file = generateFile(FILE_SIZE_MB*50)
  // console.log({file}, file.size)
  // const body = new FormData()
  // body.append("file", file)
  // const now = performance.now()
  // await fetch(url.upload, {method: "POST", body})
  // const duration = Math.floor(performance.now() - now) // in ms
  // return {
  // 	size: file.size,
  // 	duration,
  // 	speed: file.size / duration / 1000 // in Mb/s
  // }
}
function generateFile (size: number) {
  const content = "0".repeat(size)
  return new Blob([content], {type: "text/plain"})
}
