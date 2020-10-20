import express from 'express'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import { userApi } from './content/user'

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
	/* app.use((req, res, next) => {
		req.hello = ''

		next()

	}) */

	app.use(userApi('/usuarios'))
	app.listen(3000, () => {
		console.log('Servidor corriendo en el puerto 3000...')
	})
}

main()
