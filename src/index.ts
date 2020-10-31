import express, { Express } from 'express'
import configureApp from './config'
import env from './env'

export default async function main(): Promise<Express> {
	const app = express()
	await configureApp(app)
	if (env.nodeEnv !== 'test') {
		app.listen(env.port, () => {
			console.log(`Servidor corriendo en el puerto ${env.port}...`)
		})
	}

	return app
}

main()
