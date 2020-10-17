import express from 'express'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import { userApi } from './content/user'

export default async function main(): Promise<void> {
	const app = express()
	await mongoose.connect('mongodb://127.0.0.1:27017/SimpleTodoApp', {
		useNewUrlParser: true, // el viejo esta deprecated
		useCreateIndex: true, // detalle
		useFindAndModify: false, // deprecated
		useUnifiedTopology: true, // detalle
	})

	app.use(bodyParser.json())
	app.use(userApi('/usuarios'))
	// POST /usuarios/registrar
	app.listen(3000, () => {
		console.log('Servidor corriendo en el puerto 3000...')
	})
}

main()
