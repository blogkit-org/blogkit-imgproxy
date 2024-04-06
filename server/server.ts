import { serve } from 'bun'
import { startView } from './views'

export interface Req {
  request: Request
  headers: Headers
  url: URL
  method: string
  query: URLSearchParams
}

async function createRequest(request: Request): Promise<Req> {
  return {
    request,
    headers: request.headers,
    url: new URL(request.url),
    method: request.method,
    query: request.url.includes('?')
      ? new URLSearchParams(request.url.split('?')[1])
      : new URLSearchParams(),
  }
}

function handleResponse(req: Req, response: Response | any): Response {
  if (!(response instanceof Response)) {
    if (typeof response === 'string') {
      response = new Response(response, { status: 200 })
    } else if (typeof response === 'object') {
      response = new Response(JSON.stringify(response), { status: 200 })
    } else if (typeof response === 'number') {
      response = new Response(response.toString(), { status: 200 })
    } else {
      response = new Response(null, { status: 204 })
    }
  }

  const origin = req.headers.get('Origin')
  response.headers.set('Access-Control-Allow-Origin', origin || '*')
  response.headers.set('Access-Control-Allow-Credentials', 'true')

  return response
}

function setCors(req: Req) {
    if (req.method === 'OPTIONS') {
      const origin = req.headers.get('Origin')
      const responseHeaders: Record<string, string> = {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Credentials': 'true',
      }
      responseHeaders['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
      responseHeaders['Access-Control-Allow-Headers'] =
        'Content-Type, Authorization, X-Requested-With, X-TLC, X-PROJECT'
      responseHeaders['Access-Control-Max-Age'] = '3600'
      return new Response(null, {
        status: 204,
        headers: responseHeaders,
      })
    }
  
    return false
  }
  

/**
 * Handles incoming requests.
 * 1. Check CORS
 * 2. Load command
 * 3. Execute command
 * 4. Handles errors
 */
async function handleRequest(request: Request) {
  try {
    const req = await createRequest(request)

    const corsResponse = setCors(req)
    if (corsResponse) return corsResponse

    const response = await startView(req)
    return handleResponse(req, response)
  } catch (e: unknown) {
    console.error('handleRequest', e)
    return new Response('Internal Server Error', { status: 500 })
  }
}


const server = serve({
  fetch: handleRequest,
  port: process.env.PORT || 3000,
})
console.log('👉', server.port)
