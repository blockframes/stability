import { NextApiRequest, NextApiResponse } from 'next'
import { withCORS } from '@utils/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  res.json({ hello: 'world' })
}

export default withCORS(handler)
