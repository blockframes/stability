import Cors from 'cors'
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { RequestHandler } from 'express'

// Initializing the cors middleware
const cors = Cors({
  methods: ['GET', 'HEAD']
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: RequestHandler
) {
  return new Promise((resolve, reject) => {
    // @ts-ignore: TODO, fix typing and figure out a way to connect express middleware and nextjs
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

export const withCORS = (h: NextApiHandler): NextApiHandler => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    await runMiddleware(req, res, cors)
    return h(req, res)
  }
}
