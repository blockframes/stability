import { Files, IncomingForm } from 'formidable'
import { createReadStream } from 'fs'
import { flatten } from 'lodash'
import { NextApiRequest, NextApiResponse } from 'next'
import unzipper from 'unzipper'
import { parseXML } from '@utils/result'
import { loadDB } from '@utils/db'

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
      // TODO: validate data instead of hardcasting
      const buildID = req.headers['buildid'] as string
      const branch = req.headers['branch'] as string
      const buildURL = req.headers['buildurl'] as string
      const PRID = req.headers['pr'] as string
      const userID = req.headers['user'] as string
      const secret = req.headers['x-secret'] as string

      if (!buildID) {
        return res.status(400).json({ error: 'no BuildID header' })
      }

      if (secret !== SECRET) {
        return res.status(403).json({ error: 'wrong secret' })
      }

      const form = new IncomingForm()
      const db = await loadDB()

      // TODO: promisify all these callbacks and go fully async
      return form.parse(req, async (err: any, fields: any, files: Files) => {
        if (err) {
          res.status(500)
          res.end('failed')
          console.error(err)
          return
        }

        console.error('FILES=', files, Object.entries(files))

        const xmlFiles = flatten(
          await Promise.all(
            Object.entries(files).map(async ([fileName, file]) => {
              // TODO: if not zip, throw
              const zip = createReadStream(file.path).pipe(
                unzipper.Parse({ forceStream: true })
              )

              const entries = []

              for await (const entry of zip) {
                const name = entry.path
                const buffer = await entry.buffer()
                const content = buffer.toString('utf-8')
                // TODO: parse XML
                // TODO: if not XML show warning + skip with entry.autodrain();
                entries.push({ name, content })
              }

              return entries
            })
          )
        )

        const parsedEntries = await parseXML(xmlFiles)

        const metadata = {
          branch,
          buildURL,
          PRID,
          userID
        }

        db.add({ ...parsedEntries, buildID, metadata })

        const xmlFilesCount = xmlFiles.length

        res.status(201)
        return res.json({ success: true, xmlFilesCount, buildID, metadata })
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
