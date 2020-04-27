import fetch from 'isomorphic-unfetch'

const API_URL = 'http://localhost:3000/api'

describe('status api', () => {
  it('returns 200', async () => {
    const r = await fetch(`${API_URL}/status`)
    expect(r.status).toEqual(200)
  })
})

describe('POST Results API', () => {
  it('returns 200 when the query is correctly formatted', async () => {
    const r = await fetch(`${API_URL}/results/my-job-id`, {
      method: 'POST',
      headers: {}
    })
    expect(r.status).toEqual(201)
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
