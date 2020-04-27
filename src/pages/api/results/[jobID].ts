import { NextApiRequest, NextApiResponse } from 'next'
import { withCORS } from '@utils/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    query: { jobID },
    method
  } = req

  switch (method) {
    case 'GET': {
      res.status(404)
      res.end(`job not found: ${jobID}`)
      return
    }
    case 'POST': {
      console.info('POST to jobID:', jobID)
      res.status(201)
      res.end(`you have posted: ${jobID}`)
    }
  }
}

export default handler
