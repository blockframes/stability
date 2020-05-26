import { Files, IncomingForm } from 'formidable'
import { createReadStream } from 'fs'
import { flatten } from 'lodash'
import { NextApiRequest, NextApiResponse } from 'next'
import unzipper from 'unzipper'
import { parseXML, ITestResultGroup } from '@utils/result'
import { loadDB } from '@utils/db'
import axios from 'axios'

const SECRET = process.env.SECRET
const SLACK_HOOK = process.env.SLACK_WEBHOOK
const DASHBOARD_API_URL = process.env.DASHBOARD_API_URL

// test cmd:
// http -f POST localhost:3000/results/test-jobID file@./__tests__/e2e/fixtures/test-reports-1.zip

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req

  switch (method) {
    case 'GET': {
      return res.status(400).json({ error: 'invalid verb' })
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
          console.error(err)
          return res.status(500).end('failed')
        }

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

        await db.add({ ...parsedEntries, buildID, metadata })

        const xmlFilesCount = xmlFiles.length

        await pingSlack({ buildID, results: parsedEntries })

        return res
          .status(201)
          .json({ success: true, xmlFilesCount, buildID, metadata })
      })
    }
  }
}

const pingSlack = async ({
  buildID,
  results
}: {
  buildID: string
  results: ITestResultGroup
}): Promise<void> => {
  const sumAll = (xs: number[]) => xs.reduce((x, y) => x + y, 0)

  const totalStats = Object.entries(results.apps).reduce(
    (current, [name, result]) => {
      return {
        success: current.success + sumAll(result.map((x) => x.succeeded)),
        failed: current.success + sumAll(result.map((x) => x.failed))
      }
    },
    { success: 0, failed: 0 }
  )

  const detailStats = Object.entries(results.apps).reduce(
    (current, [name, result]) => {
      const success = sumAll(result.map((x) => x.succeeded))
      const failed = sumAll(result.map((x) => x.failed))

      if (failed === 0) {
        return (
          current +
          `- 🟢 ${name.toUpperCase()}: success! _(${success} tests passed)_\n`
        )
      } else {
        return current + `- 🔴 ${name.toUpperCase()}: *${failed} failed*\n`
      }
    },
    ''
  )

  const status = totalStats.failed === 0 ? 'succeeded' : 'failed'

  return axios.post(SLACK_HOOK!, {
    text: `
Build ${buildID} ${status}!

${detailStats}

Check the build details on the <${DASHBOARD_API_URL}/${buildID}|dashboard>`
  })
}

export default handler

export const config = {
  api: {
    bodyParser: false
  }
}
