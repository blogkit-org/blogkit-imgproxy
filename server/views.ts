import path from 'path'
import { Req } from './server'

const viewMap = new Map<
  string,
  null | ((req: Req) => Promise<Response | any>)
>()

/**
 * Reads the src/controllers directory, and loads a module with
 * `viewName` to memory. We avoid repeat `require` calls to improve
 * performance.
 *
 * This is just a simple cache + filter.
 */
const warmupView = async (viewName: string) => {
  if (viewMap.has(viewName)) {
    return
  }

  if (!viewName.match(/^[a-zA-Z0-9\./]+$/)) {
    if (viewName !== '/favicon.ico') {
      console.error('Invalid view name', viewName)
    }
    viewMap.set(viewName, null)
    return
  }

  const viewPath = path.join(
    import.meta.dir,
    '../views',
    viewName + '.js'
  )
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const view = require(viewPath).default
    if (typeof view !== 'function') {
      console.error('Invalid view', viewPath)
      viewMap.set(viewName, null)
    }
    viewMap.set(viewName, view)
    return
  } catch (e) {
    console.error('Error loading view', viewPath)
    console.error(e)
    console.trace()
    viewMap.set(viewName, null)
  }
}

/**
 * Loads a module from src/controllers
 */
const getView = async (
  viewName: string
): Promise<null | ((req: Req) => Promise<Response | any>)> => {
  await warmupView(viewName)
  return viewMap.get(viewName) ?? null
}


const handleError = (req: Req, error: any) => {
  let message = error.message

  if (error.response) {
    message = error.response.data?.error?.message ?? error.response.data?.error
  }

  console.error('handleError', error)

  return Response.json(
    {
      status: error?.response?.status ?? 400,
      code: error.code,
      message,
    },
    {
      status: error?.response?.status ?? 400,
    }
  )
}

/**
 * Executes a controller from src/controllers
 */
export const startView = async (req: Req) => {
  const viewName = req.url.pathname.substring(1)
  const view = await getView(viewName)

  if (!view) {
    return new Response('View not found', { status: 404 })
  }

  try {
    return await view(req)
  } catch (e: unknown) {
    return handleError(req, e)
  }
}
