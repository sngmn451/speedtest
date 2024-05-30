import type { APIRoute } from "astro"

const DEFAULT_FILE_SIZE = 1024 // 1 KB
const MAX_FILE_SIZE = 1024*1024*24
export const GET:APIRoute = async ({ request, params }) => {
  const now = performance.now()
  const index = Number(new URL(request.url).searchParams.get("index"))
  const size = await indexFileSize(index, DEFAULT_FILE_SIZE)
  const file = generateFile(size)
  const response = new Response(file, { status: 200 })
  response.headers.set("Content-Type", "text/plain")
  response.headers.set("X-Content-Length", String(size))
  response.headers.set("X-Api-Time", String(performance.now() - now))
  return response
}

async function indexFileSize (round: number, startingSize: number): Promise<number> {
  let size = startingSize
  let index = 0
  const multiplyValue = 1.024

  while (index < round) {
    index++
    if (size < MAX_FILE_SIZE) {
      size = Math.floor(size * multiplyValue)
    } else {
      break
    }
  }
  return size
}
function generateFile (size: number) {
  const content = "0".repeat(size < MAX_FILE_SIZE ? size : MAX_FILE_SIZE)
  return new Blob([content], {type: "text/plain"})
}
