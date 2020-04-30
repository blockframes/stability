import FormData from 'form-data'
import fs from 'fs'
import { IncomingMessage } from 'http'
import fetch from 'isomorphic-unfetch'

const API_HOST = 'localhost'
const API_PORT = 3000
const SECRET = 'helloworld'
const u = (path: string) => `http://${API_HOST}:${API_PORT}/api${path}`

// const dbg = (f: any): any => {
//     return (...args: any[]) => {
//         console.log('<<< INPUT:', args)
//         const result = f(...args)
//         console.log('>>> RESULT:', result)
//         return result
//     }
// }

const loadZip = (path: string): FormData => {
  const form = new FormData()
  form.append('testFile', fs.createReadStream(path))
  return form
}

const consumeJSON = (x: IncomingMessage): any => {
  return new Promise((resolve) => {
    let body = ''
    x.on('data', (chunk) => {
      body += chunk
    })
    x.on('end', () => {
      resolve(JSON.parse(body))
    })
  })
}

describe('status api', () => {
  it('returns 200', async () => {
    const r = await fetch(u('/status'))
    expect(r.status).toEqual(200)
  })
})

describe('POST Results API', () => {
  it('returns 200 when the query is correctly formatted', async () => {
    const r = await fetch(u('/results'), {
      method: 'POST',
      headers: {}
    })
    expect(r.status).toEqual(201)
  })

  it('can upload data', async () => {
    const formData = loadZip('./__tests__/e2e/fixtures/test-reports-1.zip')

    const r = await new Promise<IncomingMessage>((resolve, reject) => {
      formData.submit(
        {
          host: API_HOST,
          port: API_PORT,
          path: '/api/results',
          headers: { 'X-Secret': SECRET }
        },
        (err: Error | null, res) => (err ? reject(err) : resolve(res))
      )
    })

    expect(r.statusCode).toEqual(201)
    const json = await consumeJSON(r)

    expect(json['xmlFilesCount']).toEqual(16)
    expect(json['buildID']).toEqual('SomeBuildID')
  })

  it('throws forbidden when no secrets are provided', async () => {
    const formData = loadZip('./__tests__/e2e/fixtures/test-reports-1.zip')

    const r = await new Promise<IncomingMessage>((resolve, reject) => {
      formData.submit(
        {
          host: API_HOST,
          port: API_PORT,
          path: '/api/results',
          headers: { 'X-Secret': 'WRONG_SECRET' }
        },
        (err: Error | null, res) => (err ? reject(err) : resolve(res))
      )
    })

    expect(r.statusCode).toEqual(403)
  })
})

describe('GET Results API', () => {
  it("returns 404 when the job doesn't exists", async () => {
    const r = await fetch(u('/results/some-unknown-job-id'), {
      method: 'GET',
      headers: {}
    })
    expect(r.status).toEqual(404)
  })
})

// describe('status api', () => {
//     it('returns 200', async () => {
//         const r = await fetch(`${API_URL}/status`)
//         expect(r.status).toEqual(200);
//     })
// })

// describe('webfinger api', () => {
//     it('returns jrd json', async () => {
//         const r = await fetch(`${API_URL}/.well-known/webfinger?resource=acct:JohnDoe@localhost`)
//         expect(r.status).toEqual(200);
//         expect(r.headers.get('Content-Type')).toContain('application/jrd+json')
//     })
// })

// describe('me api', () => {
//     it('returns 200', async () => {
//         const r = await fetch(`${API_URL}/me`)
//         expect(r.status).toEqual(200);
//     })

//     it('returns * CORS', async () => {
//         const r = await fetch(`${API_URL}/me`)
//         expect(r.headers.get('Access-Control-Allow-Origin')).toEqual('*')
//     })

//     it('returns activity json data', async () => {
//         const r = await fetch(`${API_URL}/me`)
//         expect(r.headers.get('Content-Type')).toContain('application/activity+json')
//     })
// })
