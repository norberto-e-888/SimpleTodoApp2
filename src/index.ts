import express, { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import { userApi } from './content/user'
import { AppError } from './lib'
import { todoApi } from './content/todo'

export default async function main(): Promise<void> {
	const app = express()
	await mongoose.connect('mongodb://127.0.0.1:27017/SimpleTodoApp', {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
		useUnifiedTopology: true,
	})

	app.use(bodyParser.json())
	app.use(cookieParser())
	app.use(userApi('/usuarios'))
	app.use(todoApi('/tareas'))
	app.use((error: AppError, _: Request, res: Response, __: NextFunction) => {
		return res.status(error.statusCode || 500).json({
			isError: true,
			message: error.error || error.message || 'Oooops! Algo salío mal',
			errors: error.validationErrors,
		})
	})

	app.listen(3000, () => {
		console.log('Servidor corriendo en el puerto 3000...')
	})
}

main()
