import { SpeedCard } from "@/components/speed/card"
import { xhr } from "@/lib/xhr"
import { useMemo, useState } from "react"

export function SpeedTestContainer () {
  const [pingms, setPingms] = useState<number>(0)
  const [downloadSpeed, setDownloadSpeed] = useState<number[]>([])
  const [downloadLossCount, setDownloadLossCount] = useState<number>(0)
  const [downloadErrorCount, setDownloadErrorCount] = useState<number>(0)
  const [speedTestState, setSpeedTestState] = useState<"INIT" | "TESTING" | "FINISH">("INIT")
  const [uploadSpeed, setUploadSpeed] = useState<number[]>([])
  async function onClick () {
    let fileSize = 1024 //1KB
    const MAX_ROUNDS = 50
    const MAX_TIME_PER_REQUEST_IN_MS = 200
    let round = 0
    setSpeedTestState("TESTING")
    do {
      const downloadSpeed = await DownloadSpeedTest(fileSize, MAX_TIME_PER_REQUEST_IN_MS)
      if (downloadSpeed.timeout) {
        setDownloadErrorCount(downloadErrorCount + 1)
      } else if (downloadSpeed.error) {
        setDownloadLossCount(downloadLossCount + 1)
      } else {
        setDownloadSpeed(cur => [
          ...cur,
          downloadSpeed.speed || 0
        ])
        if (downloadSpeed.time! < 100 && fileSize < 250000000) {
          fileSize = fileSize*2
        }
        if (round === 1) {
          setPingms(downloadSpeed.ping!)
        }
      }
      round++
    } while (round < MAX_ROUNDS)
    console.log({round})
    setSpeedTestState("FINISH")
    // const upload = await UploadSpeedTest()
    // console.log({upload})
  }
  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="grid grid-cols-3 gap-4">
        <SpeedCard title="Ping" description={`${Math.floor(pingms)} ms`} />
        <SpeedCard title="Lost" description={String(downloadLossCount)} />
        <SpeedCard title="Error" description={String(downloadErrorCount)} />
      </div>
      <div className="flex-1" />
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="text-center text-xl font-display">
          <span>{downloadSpeed.length > 0 ? `${Math.ceil(downloadSpeed.reduce((acc, speed) => acc + speed, 0)/downloadSpeed.length)} Mbps` : "Begin speed test ⚡"}</span>
        </div>
        {speedTestState === "TESTING" && "Testing"}
        {speedTestState == "INIT" && <button className="w-24 h-24 border rounded-full shadow-primary shadow-lg hover:shadow-accent" onClick={onClick}>Start</button>}
        {speedTestState === "FINISH" && <div>Done</div>}
        {/* <div>{downloadLossCount}</div>
        <div>{downloadErrorCount}</div> */}
        {/* <div>
          {downloadSpeed.map((result, index) =>
            <div key={index}>
              {result}
            </div>
          )}
        </div> */}
      </div>
      <div className="flex-1" />
    </div>
  )
}


const url = {
  download: "/api/speed-test/download",
  upload: "/api/speed-test/upload"
}
function generateFile (size: number) {
  const content = "0".repeat(size)
  return new Blob([content], {type: "text/plain"})
}
/**
 * Test download speed of a file with specific size within ttl, request over ttl will return 408 error, error will return Http error, otherwise it will return the speed in Mb/s
 * @param size in Bytes
 * @param ttl in ms
 */
async function DownloadSpeedTest (size: number, ttl: number): Promise<{
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
  const FILE_SIZE_KBIT = 1024*8
  const FILE_SIZE_MBIT = FILE_SIZE_KBIT*1024
  
  const now = performance.now()
  const response = await xhr(`${url.download}?size=${size}&t=${new Date().getTime()}`, { ttl })
  
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
  const fileSizeInMb = fileSizeInBits/FILE_SIZE_MBIT
  const ApiTime = Number(response.headers!["x-api-time"])
  const downloadTimeInMs = (fetchDuration - ApiTime)
  const downloadTimeInSeconds = downloadTimeInMs / 1000

  speed = fileSizeInMb / downloadTimeInSeconds // in Mb/s

  return {
    success: response.success,
    speed,
    ping: response.ping,
    time: downloadTimeInSeconds,
    error,
    timeout
  }
}
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
