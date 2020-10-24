import Agenda from 'agenda'
import { Db } from 'mongodb'
import { Types } from 'mongoose'
import { TodoModel } from '../content/todo'
import { UserModel } from '../content/user'
import { ELanguage, ESentiment } from '../content/user/model'
import env from '../env'
import { textAnalysisClient } from '../lib'

export const analyzeText = 'AnalyzeText'
export default async (mongo: Db) => {
	const agenda = new Agenda({
		db: { address: env.db.mongoUri, collection: 'crons' },
		mongo,
		processEvery: 2000,
	})

	agenda.define(analyzeText, async () => {
		try {
			const groups = await TodoModel.aggregate([
				{
					$match: {
						// filtrar
						createdAt: {
							$gte: new Date(
								Date.now() - env.azure.processTextEveryNMilliseconds
							),
						},
					},
				},
				{
					$group: {
						// agrupar
						_id: '$user',
						texts: {
							$push: '$body',
						},
					},
				},
				{
					$project: {
						// cambiar de forma
						id: {
							$toString: '$_id',
						},
						text: {
							$reduce: {
								input: '$texts',
								initialValue: '',
								in: { $concat: ['$$value', '$$this', ' '] },
							},
						},
						_id: 0,
					},
				},
			])

			if (!groups.length) return
			const [sentimentResults, languageResults] = (await Promise.all([
				textAnalysisClient.analyzeSentiment(groups),
				textAnalysisClient.detectLanguage(groups),
			])) as [ISentimentResult[], ILanguageResult[]]

			console.log(sentimentResults, languageResults)
			const userUpdates: IUserUpdates = {}
			for (const { id, sentiment } of sentimentResults) {
				userUpdates[id] = { sentiment }
			}

			for (const {
				id,
				primaryLanguage: { iso6391Name },
			} of languageResults) {
				const update = { ...userUpdates[id] }
				if (Object.values(ELanguage).includes(iso6391Name as ELanguage)) {
					update.language = iso6391Name as ELanguage
				}

				userUpdates[id] = update
			}

			let bulk = UserModel.collection.initializeUnorderedBulkOp()
			let count = 0
			for (const [id, update] of Object.entries(userUpdates)) {
				bulk.find({ _id: Types.ObjectId(id) }).updateOne({ $set: update })
				count++
				if (count === 500) {
					await bulk.execute()
					count = 0
					bulk = UserModel.collection.initializeUnorderedBulkOp()
				}
			}

			if (count > 0) {
				await bulk.execute()
			}

			console.log(`${analyzeText} corrió exitosamente`)
		} catch (error) {
			console.error(error)
		}
	})

	agenda.every('1 minute', analyzeText)
	await agenda.start() // el tick: periodo de verificar la base de datos para ver si hay que correr algún cron
}

/**
 * [{
 *  id: userId
 *  text: cádena generada por la concatenación de los elementos del arreglos texts
 * },
 * {
 *  id: userId
 *  text: cádena generada por la concatenación de los elementos del arreglos texts
 * }
 * ]
 *
 *
 * {
 * 	a: 1,
 * 	b: 2,
 * 	c: 15
 * } -> Object.entries(this) -> [["a",1], ["b",2], ["c", 15]]
 *
 */

interface ISentimentResult {
	id: string
	sentiment: ESentiment
}

interface ILanguageResult {
	id: string
	primaryLanguage: {
		iso6391Name: string
	}
}

interface IUserUpdates {
	[key: string]: {
		sentiment?: ESentiment
		language?: ELanguage
	}
}
