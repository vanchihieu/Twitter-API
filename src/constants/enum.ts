export enum UserVerifyStatus {
    Unverified, // 0
    Verified, // 1
    Banned // 2
}

export enum TokenType {
    AccessToken, // 0
    RefreshToken, // 1
    ForgotPasswordToken, // 2
    EmailVerifyToken // 3
}

export enum MediaType {
    Image,
    Video,
    HLS
}

export enum TweetType {
    Tweet,
    Retweet,
    Comment,
    QuoteTweet
}

export enum TweetAudience {
    Everyone,
    TwitterCircle // 1 - Chỉ bạn bè thân thiết mới xem được
}
