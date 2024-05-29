import type { APIRoute } from "astro"

const DEFAULT_FILE_SIZE = 1024*1024*1 // 1 mb
export const GET:APIRoute = async ({ request, params }) => {
  const now = performance.now()
  const size = Number(new URL(request.url).searchParams.get("size")) || DEFAULT_FILE_SIZE
  const file = generateFile(size)
  const response = new Response(file, { status: 200 })
  response.headers.set("Content-Type", "text/plain")
  response.headers.set("Content-Length", String(size))
  response.headers.set("X-Api-Time", String(performance.now() - now))
  return response
}

function generateFile (size: number) {
  const content = "0".repeat(size < 500000000 ? size : 50000000)
  return new Blob([content], {type: "text/plain"})
}
