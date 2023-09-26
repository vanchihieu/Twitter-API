import { MongoClient } from 'mongodb'
import { config } from 'dotenv'
config()
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.waln3ff.mongodb.net/?retryWrites=true&w=majority`

class DatabaseService {
  private client: MongoClient
  constructor() {
    this.client = new MongoClient(uri)
  }
  async connect() {
    try {
      await this.client.db('admin').command({ ping: 1 })
      console.log('Connected successfully to database server')
    } finally {
      await this.client.close()
    }
  }
}

const databaseService = new DatabaseService()
export default databaseService
