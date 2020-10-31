import mongoose, { Mongoose } from 'mongoose'
import { Express } from 'express'
import { IUserDocument } from '../content/user/model'
import { authenticate, mockSignUp } from './helpers'
import env from '../env'
import main from '..'

beforeAll(async () => {
	const connection = await mongoose.connect(env.db.mongoUri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify: false,
	})

	const app = await main()
	global.app = app
	global.connection = connection
})

beforeEach(async () => {
	const collections = await mongoose.connection.db.collections()
	for (let collection of collections) {
		await collection.deleteMany({})
	}
})

afterAll(async () => {
	await mongoose.connection.close()
})

global.mockSignUp = mockSignUp
global.authenticate = authenticate

declare global {
	namespace NodeJS {
		interface Global {
			app: Express
			connection: Mongoose
			mockSignUp(dto: any): Promise<IUserDocument>
			authenticate(
				dto: any,
				type?: 'inicio' | 'registrar'
			): Promise<{ [key: string]: any }>
		}
	}
}
