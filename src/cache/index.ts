import { NextFunction, Request, Response } from 'express'
import { IAuthenticatedRequest } from '../content/user/controller'
import env from '../env'
import { redisClient } from '../lib'

export const createChacheKey = (req: IAuthenticatedRequest) => {
	if (env.nodeEnv === 'production') return
	return `resource-${req.originalUrl}:user-${
		req.user?.id
	}:query-${JSON.stringify(req.query)}`
}

export const useChache = (req: Request, res: Response, next: NextFunction) => {
	if (env.nodeEnv === 'production') return next()
	const key = createChacheKey(req)
	// @ts-ignore
	redisClient.get(key, (err, value) => {
		if (err || !value) {
			return next()
		}

		return res.status(200).json(JSON.parse(value))
	})
}

export const deleteUserCache = (userId: string) => {
	if (env.nodeEnv === 'production') return
	// @ts-ignore
	redisClient.keys(`*user-${userId}*`, async (err, keys) => {
		if (err) {
			return
		}

		const deletePromises = keys.map((key) => {
			return new Promise((resolve) => {
				// @ts-ignore
				redisClient.del(key, () => resolve())
			})
		})

		await Promise.all(deletePromises)
	})
}
