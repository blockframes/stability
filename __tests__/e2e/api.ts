import FormData from 'form-data'
import fs from 'fs'
import { IncomingMessage } from 'http'
import fetch from 'isomorphic-unfetch'

const API_URL = 'http://localhost:3000/api'

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
    const r = await fetch(`${API_URL}/status`)
    expect(r.status).toEqual(200)
  })
})

describe('POST Results API', () => {
  it('returns 200 when the query is correctly formatted', async () => {
    const r = await fetch(`${API_URL}/results`, {
      method: 'POST',
      headers: {}
    })
    expect(r.status).toEqual(201)
  })

  it('can upload data', async () => {
    const formData = loadZip('./__tests__/e2e/fixtures/test-reports-1.zip')

    const r = await new Promise<IncomingMessage>((resolve, reject) => {
      formData.submit(`${API_URL}/results`, (err, res) =>
        err ? reject(err) : resolve(res)
      )
    })

    expect(r.statusCode).toEqual(201)
    const json = await consumeJSON(r)
    expect(json['xmlFilesCount']).toEqual(16)
  })
})

describe('GET Results API', () => {
  it("returns 404 when the job doesn't exists", async () => {
    const r = await fetch(`${API_URL}/results/some-unknown-job-id`, {
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
