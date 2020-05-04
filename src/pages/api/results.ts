import { NextApiRequest, NextApiResponse } from 'next'
import { withCORS } from '@utils/api'
import FormData from 'form-data'
import { IncomingForm, Files } from 'formidable'
import unzipper from 'unzipper'
import { createReadStream } from 'fs'
import { flatten } from 'lodash'

const SECRET = process.env.SECRET
// test cmd:
// http -f POST localhost:3000/results/test-jobID file@./__tests__/e2e/fixtures/test-reports-1.zip

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req

  switch (method) {
    case 'GET': {
      res.status(404)
      res.end('TODO: use different status code')
      return
    }
    case 'POST': {
      console.log(req.headers)

      const buildID = req.headers['buildid']
      const secret = req.headers['x-secret']

      if (!buildID) {
        return res.status(400).json({ error: 'no BuildID header' })
      }
      console.info('secret', secret, SECRET)
      if (secret !== SECRET) {
        return res.status(403).json({ error: 'wrong secret' })
      }

      const form = new IncomingForm()

      // TODO: promisify all these callbacks and go fully async
      return form.parse(req, async (err: any, fields: any, files: Files) => {
        if (err) {
          res.status(500)
          res.end('failed')
          console.error(err)
          return
        }

        const xmlFiles = flatten(
          await Promise.all(
            Object.entries(files).map(async ([fileName, file]) => {
              console.info(fileName)

              // TODO: if not zip, throw
              const zip = createReadStream(file.path).pipe(
                unzipper.Parse({ forceStream: true })
              )

              const entries = []

              for await (const entry of zip) {
                const name = entry.path
                const buffer = await entry.buffer()
                const content = buffer.toString('utf-8')
                console.info(name, 'content=', content)
                // TODO: parse XML
                // TODO: if not XML show warning + skip with entry.autodrain();
                entries.push({ name, content })
              }

              return entries
            })
          )
        )

        const xmlFilesCount = xmlFiles.length

        res.status(201)
        return res.json({ success: true, xmlFilesCount, buildID })
      })
    }
  }
}

export default handler

export const config = {
  api: {
    bodyParser: false
  }
}
