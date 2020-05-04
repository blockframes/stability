import { MongoClient } from 'mongodb'
import { ITestResultGroup } from './result'
require('dotenv').config()

const MONGO_URL = process.env.MONGO_URL
const MONGO_DB_NAME = process.env.MONGO_DB_NAME

if (!MONGO_URL) {
  throw new Error('no mongodb url')
}

export const loadDB = async (dbNameSuffix: string = '') => {
  const client = await MongoClient.connect(MONGO_URL)
  console.log('Connected successfully to server')
  const db = client.db(MONGO_DB_NAME + dbNameSuffix)
  const collection = db.collection('jobResults')

  const add = async (job: ITestResultGroup): Promise<void> => {
    const doc = { ...job, _id: job.buildID }
    await collection.updateOne(
      { _id: job.buildID },
      {
        $set: { ...doc, updated: new Date() },
        $setOnInsert: { created: new Date() }
      },
      { upsert: true }
    )
  }

  const get = async (jobID: string): Promise<ITestResultGroup> => {
    const doc = await collection.findOne({ _id: jobID })
    return doc
  }

  return { db, client, add, get, collection }
}
