import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { errorHandler } from './middlewares/error.middlewares'
import mediasRouter from '~/routes/medias.routes'
import { initFolder } from '~/utils/file'

const app = express()
const port = 3000

// Tạo folder upload
initFolder()
app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)

databaseService.connect()

// handler error

app.use(errorHandler)

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
