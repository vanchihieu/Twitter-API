import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { ErrorRequestHandler } from 'express'
const app = express()
const port = 3000

app.use(express.json())
app.use('/users', usersRouter)
databaseService.connect()

// handler error

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.log(err.message)
    res.status(400).json({ message: err.message })
}

app.use(errorHandler)

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
