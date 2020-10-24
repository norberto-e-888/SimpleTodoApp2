import Agenda from 'agenda'
import { Db } from 'mongodb'
import { TodoModel } from '../content/todo'
import env from '../env'

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

			// arr.map -> res.length === arr.length -> true
			// arr.filter -> res.length <= arr.length -> true
			// arr.reduce -> res.length === 1 -> true
			//    -1 -> 0
			const a = [{ edad: 10 }, { edad: 20 }, { edad: 80 }, { edad: 50 }]

			/*
i -> 0 : prev -> 0, current -> {edad: 10} -> 10
i -> 1 : prev -> 10, current -> {edad: 20} -> 30
i -> 2 : prev -> 30, current -> {edad: 80} -> 110
i -> 3 : prev -> 110, current -> {edad: 50} -> 160

* */

			const totalDeEdades = a.reduce((prev, current) => {
				return prev + current.edad
			}, 0)

			console.log('totalDeEdades', totalDeEdades)
			console.log(analyzeText + ' corrió exitosamente, grupos:', groups)
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
