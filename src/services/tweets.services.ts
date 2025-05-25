import databaseService from '~/services/database.services'
import { ObjectId, WithId } from 'mongodb'
import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import Tweet from '~/models/schemas/Tweet.schema'
import Hashtag from '~/models/schemas/Hashtag.schema'

class TweetsService {
    async checkAndCreateHashtags(hashtags: string[]) {
        const hashtagDocuments = await Promise.all(
            hashtags.map((hashtag) => {
                // Tìm hashtag trong database, nếu có thì lấy, không thì tạo mới
                return databaseService.hashtags.findOneAndUpdate(
                    { name: hashtag },
                    {
                        $setOnInsert: new Hashtag({ name: hashtag })
                    },
                    {
                        upsert: true,
                        returnDocument: 'after'
                    }
                )
            })
        )

        return hashtagDocuments.map((hashtag) => (hashtag as WithId<Hashtag>)._id)
    }

    async createTweet(user_id: string, body: TweetRequestBody) {
        const hashtags = await this.checkAndCreateHashtags(body.hashtags)
        const result = await databaseService.tweets.insertOne(
            new Tweet({
                audience: body.audience,
                content: body.content,
                hashtags, // Chỗ này chưa làm, tạm thời để rỗng
                mentions: body.mentions,
                medias: body.medias,
                parent_id: body.parent_id,
                type: body.type,
                user_id: new ObjectId(user_id)
            })
        )

        const tweet = await databaseService.tweets.findOne({ _id: result.insertedId })

        return tweet
    }
}

const tweetsService = new TweetsService()

export default tweetsService
