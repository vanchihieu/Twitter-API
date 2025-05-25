import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { errorHandler } from './middlewares/error.middlewares'
import mediasRouter from '~/routes/medias.routes'
import { initFolder } from '~/utils/file'
import staticRouter from '~/routes/static.routes'
import { UPLOAD_VIDEO_DIR } from '~/constants/dir'

const app = express()
const port = 3000

// Tạo folder upload
initFolder()
app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/static', staticRouter)
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))

databaseService.connect().then(() => {
    databaseService.indexUsers()
    databaseService.indexRefreshTokens()
    databaseService.indexFollowers()
})
// handler error

app.use(errorHandler)

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
