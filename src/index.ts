import express from 'express'
import configureApp from './config'
import env from './env'

export default async function main(): Promise<void> {
	const app = express()
	await configureApp(app)
	app.listen(env.port, () => {
		console.log(`Servidor corriendo en el puerto ${env.port}...`)
	})
}

main()
