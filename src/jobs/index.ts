import Agenda from 'agenda'
import { Db } from 'mongodb'
import { Types } from 'mongoose'
import { TodoModel } from '../content/todo'
import { EStatus } from '../content/todo/model'
import { UserModel } from '../content/user'
import { ELanguage, ESentiment } from '../content/user/model'
import env from '../env'
import { textAnalysisClient } from '../lib'

const analyzeText = 'AnalyzeText'
const moveToTrash = 'MoveToTrash'
const emptyTrash = 'emptyTrash'
export default async (mongo: Db) => {
	const agenda = new Agenda({
		db: { address: env.db.mongoUri, collection: 'crons' },
		mongo,
		processEvery: 1000 * 60 * 5,
	})

	agenda.define(analyzeText, async () => {
		try {
			const groups = await TodoModel.aggregate([
				{
					$match: {
						createdAt: {
							$gte: new Date(
								Date.now() - env.azure.processTextEveryNMilliseconds
							),
						},
					},
				},
				{
					$group: {
						_id: '$user',
						texts: {
							$push: '$body',
						},
					},
				},
				{
					$project: {
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

			/**
			 * [{
			 * 	_id: ObjectId('5f93850bd574f631f4e9e558'),
			 *  texts: ['fdsfsd', 'sdfsdf', 'asdfasdf']
			 * },{
			 * _id: ObjectId('5f93850bd574f631f4e9e559'),
			 *  texts: ['fdsfsd', 'sdfsdf', 'jkasjdfkjaskdf', 'asdfasdf']
			 * }]
			 */

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

	agenda.define(moveToTrash, async () => {
		try {
			await TodoModel.updateMany(
				{
					status: EStatus.Completed,
					movedDate: {
						$lte: new Date(
							Date.now() - env.todos.sendCompletedToTrashAfterNMilliseconds
						),
					},
				},
				{ status: EStatus.Trash }
			)
		} catch (error) {
			console.error(error)
		}
	})

	agenda.define(emptyTrash, async () => {
		try {
			await TodoModel.deleteMany({
				status: EStatus.Trash,
				movedDate: {
					$lte: new Date(
						Date.now() - env.todos.deleteAfterNMillisecondsInTrash
					),
				},
			})
		} catch (error) {
			console.error(error)
		}
	})

	agenda.every('5 minutes', analyzeText)
	agenda.every('1 day', moveToTrash)
	agenda.every('1 day', emptyTrash)
	await agenda.start()
}

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
