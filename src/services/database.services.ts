import { Collection, Db, MongoClient } from 'mongodb'
import { config } from 'dotenv'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { envConfig } from '~/constants/config'
import Follower from '~/models/schemas/Follower.schema'
// config()

// const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.waln3ff.mongodb.net/?retryWrites=true&w=majority`
const uri = `mongodb+srv://${envConfig.dbUsername}:${envConfig.dbPassword}@cluster0.b5osxw4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

class DatabaseService {
    private client: MongoClient
    private db: Db

    constructor() {
        this.client = new MongoClient(uri)
        this.db = this.client.db(envConfig.dbName)
    }
    async connect() {
        try {
            await this.db.command({ ping: 1 })
            console.log('Connected successfully to database server')
        } catch (error) {
            console.log('Could not connect to database server')
            console.log(error)
        }
    }

    get users(): Collection<User> {
        return this.db.collection(envConfig.dbUsersCollection)
    }

    get refreshToken(): Collection<RefreshToken> {
        return this.db.collection(envConfig.dbRefreshTokensCollection)
    }

    get followers(): Collection<Follower> {
        return this.db.collection(envConfig.dbFollowersCollection)
    }
}

const databaseService = new DatabaseService()
export default databaseService
