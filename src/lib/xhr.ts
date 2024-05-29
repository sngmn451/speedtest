type Method = "GET" | "POST"

export function xhr<T = unknown>(url: string | URL, {
  method, body, headers, ttl, onLoad, onError
}: {
  method?: Method
  body?: string
  headers?: Headers
  ttl?: number
  onLoad?: (response: {
    success: boolean
    data: T
    ping: number
    headers: Record<string,string>
  }) => void
  onError?: (response: {
    success: boolean
    status: number
    statusText: string
  }) => void
}): Promise<{
  success: true
  data?: T
  ping: number
  headers?: Record<string,string>
} | {
  success: false
  status?: number
  statusText?: string
}> {
  let error
  return new Promise(function (resolve, reject) {
    let xhr = new XMLHttpRequest()
    let response = false
    let ping: number
    try {
      xhr.open(method || "GET", url)
      xhr.onload = function () {
        response = true
        if (this.status >= 200 && this.status < 300) {
          // Prepare headers
          const headers = xhr.getAllResponseHeaders().trim().split(/[\r\n]+/)
          const headerMap: Record<string,string> = {}
          headers.forEach((line) => {
            const parts = line.split(": ")
            headerMap[parts.shift() as string] = parts.join(": ");     
          })

          if (onLoad) {
            onLoad({
              success: true,
              data: xhr.responseText === "application/json" ? JSON.parse(xhr.response) as T : xhr.response,
              ping,
              headers: headerMap
            })
          } else {
            resolve({
              success: true,
              data: xhr.responseText === "application/json" ? JSON.parse(xhr.response) as T : xhr.response,
              ping,
              headers: headerMap
            })
          }
        } else {
          error = {
            success: false,
            status: this.status,
            statusText: xhr.statusText
          }
          if (onError) {
            onError(error)
          } else {
            reject(error)
          }
          xhr.onerror = function () {
            reject({
              success: false,
              status: this.status,
              statusText: xhr.statusText
            })
          }
        }
      }
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 2 && xhr.status == 200) {
          ping = performance.now() - start
        }
      }
      const start = performance.now()
      xhr.onprogress = function () {
        if (ttl) {
          setTimeout(() => {
            if (!response) {
              xhr.abort()
              reject({
                success: false,
                status: 408,
                statusText: "Request Timeout"
              })      
            }
          }, ttl)
        }
      }
      xhr.send()
    } catch (error) {
      error = {
        status: 500,
        statusText: JSON.stringify(error)
      }
      if (onError) {
        onError
      } else {
        reject(error)
      }
    }
  })
}
