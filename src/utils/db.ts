import { MongoClient } from 'mongodb'
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
  return { db, client }
}
