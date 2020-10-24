import Agenda from 'agenda'
import { Db } from 'mongodb'
import { TodoModel } from '../content/todo'
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
							$gte: new Date(Date.now() - 300000), // 5 minutos en milisegundos,
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

			console.log('userUpdates', userUpdates)
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
