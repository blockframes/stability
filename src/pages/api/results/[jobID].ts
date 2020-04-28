import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    query: { jobID },
    method,
    body
  } = req

  switch (method) {
    case 'GET': {
      res.status(404)
      res.end(`job not found: ${jobID}`)
      return
    }
    case 'POST': {
      res.status(404)
      res.end('TODO: use different status code')
      return
    }
  }
}

export default handler
