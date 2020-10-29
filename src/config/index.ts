import { Express, Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import mongoSanitize from 'express-mongo-sanitize'
import cors from 'cors'
import { userApi } from '../content/user'
import { AppError } from '../lib'
import { todoApi } from '../content/todo'
import jobs from '../jobs'
import env from '../env'

export default async (app: Express) => {
	const {
		connection: { db },
	} = await mongoose.connect(env.db.mongoUri, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
		useUnifiedTopology: true,
	})

	await jobs(db)
	app.use(
		cors({
			credentials: true,
			exposedHeaders: ['set-cookie'],
			origin: [env.clientUrl],
		})
	)

	app.use(bodyParser.json())
	app.use(cookieParser())
	app.use(mongoSanitize())
	app.use(userApi('/usuarios'))
	app.use(todoApi('/tareas'))
	app.use((error: AppError, _: Request, res: Response, __: NextFunction) => {
		return res.status(error.statusCode || 500).json({
			isError: true,
			message: error.error || error.message || 'Oooops! Algo salío mal',
			errors: error.validationErrors,
		})
	})

	app.use((req, res) => {
		return res
			.status(404)
			.send(`${req.method} ${req.originalUrl} no existe en este servidor`)
	})
}
