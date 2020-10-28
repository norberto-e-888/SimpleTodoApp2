import { NextFunction, Request, Response } from 'express'
import { IAuthenticatedRequest } from '../content/user/controller'
import { redisClient } from '../lib'

export const createChacheKey = (
	req: IAuthenticatedRequest,
	resource: TResource
) =>
	`resource-${resource}:user-${req.user?.id}:query-${JSON.stringify(req.query)}`

export const useChache = (req: Request, res: Response, next: NextFunction) => {
	const key = createChacheKey(req, 'todos')
	redisClient.get(key, (err, value) => {
		if (err || !value) {
			return next()
		}

		return res.status(200).json(JSON.parse(value))
	})
}

export const deleteUserCache = (userId: string) => {
	redisClient.keys(`*user-${userId}*`, async (err, keys) => {
		if (err) {
			return
		}

		const deletePromises = keys.map((key) => {
			return new Promise((resolve) => {
				redisClient.del(key, () => resolve())
			})
		})

		await Promise.all(deletePromises)
	})
}

type TResource = 'todos'
