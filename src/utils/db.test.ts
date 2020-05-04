require('dotenv').config()
import { loadDB } from './db'
import { ITestResultGroup } from './result'

describe('check mongo setup', () => {
  it('it exists', async () => {
    expect(loadDB).toBeTruthy()
  })

  it('can connect and list the content', async () => {
    // arrange
    const { collection } = await loadDB('test-1')

    // act
    const count = await collection.count()

    // assert
    expect(count).toEqual(0)
  })

  it('can add a test result and get it back', async () => {
    // arrange
    const { add, get, collection } = await loadDB('test-2')
    const someJob = { jobId: 'helloworld' }

    // act
    await add((someJob as unknown) as ITestResultGroup)
    const retrieved = await get(someJob.jobId)
    const count = await collection.count()

    // assert
    expect(count).toEqual(1)
    expect(retrieved).toBeTruthy()
    expect(retrieved.jobId).toEqual(someJob.jobId)
  })
})
