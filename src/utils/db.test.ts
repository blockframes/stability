require('dotenv').config()
import { loadDB } from './db'

describe('check mongo setup', () => {
  it('it exists', async () => {
    expect(loadDB).toBeTruthy()
  })

  it('can connect and list the content', async () => {
    // arrange
    const { db, client } = await loadDB('test-1')

    // act
    const count = await db.collection('jobResults').count()

    // expect
    expect(count).toEqual(0)
  })
})
