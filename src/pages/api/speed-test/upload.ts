import type { APIRoute } from "astro"

export const POST:APIRoute = async ({ request }) => {
  const file = (await request.formData()).get("file")
  console.log({file}, file)
  return new Response("OK", { status: 200 })
}
