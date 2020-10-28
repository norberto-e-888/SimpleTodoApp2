import { NextFunction, Response } from 'express'
import { TodoModel } from '..'
import { createChacheKey, deleteUserCache } from '../../../cache'
import { redisClient } from '../../../lib'
import { IAuthenticatedRequest } from '../../user/controller'

export const handleCreateTodo = async (
	req: IAuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const newTodo = await TodoModel.create(req.body)
		deleteUserCache(req.user?.id as string)
		return res.status(201).json(newTodo.toObject())
	} catch (error) {
		return next(error)
	}
}

export const handleFetchTodos = async (
	req: IAuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const todos = await TodoModel.find({ user: req.user?.id })
		const key = createChacheKey(req, 'todos')
		redisClient.set(key, JSON.stringify(todos))
		redisClient.expire(key, 60 * 15)
		return res.json(todos)
	} catch (error) {
		return next(error)
	}
}
