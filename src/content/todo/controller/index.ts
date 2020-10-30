import { NextFunction, Response } from 'express'
import { TodoModel } from '..'
import { createChacheKey, deleteUserCache } from '../../../cache'
import env from '../../../env'
import { AppError, redisClient } from '../../../lib'
import { IAuthenticatedRequest } from '../../user/controller'
import { IUserDocument } from '../../user/model'
import { EStatus } from '../model'

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
		// @ts-ignore
		const query: IQuery = req.query
		const todos = await TodoModel.find(query.match)
			.sort(query.sort)
			.skip((query.page - 1) * query.pageSize)
			.limit(query.pageSize)

		const count = await TodoModel.find(query.match).countDocuments()
		const data = { todos, count }
		if (env.nodeEnv === 'development') {
			const key = createChacheKey(req)
			// @ts-ignore
			redisClient.set(key, JSON.stringify(data))
			// @ts-ignore
			redisClient.expire(key, 60 * 15)
		}

		return res.json(data)
	} catch (error) {
		return next(error)
	}
}

export const handleUpdateTodo = async (
	req: IAuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = req.user as IUserDocument
		const updatedTodo = await TodoModel.findOneAndUpdate(
			{ _id: req.params.todo, user: user.id },
			req.body,
			{ new: true, runValidators: true }
		)

		if (!updatedTodo) {
			throw new AppError('Todo not found.', 404)
		}

		deleteUserCache(req.user?.id as string)
		return res.status(200).json(updatedTodo)
	} catch (error) {
		return next(error)
	}
}

export const handleDeleteTodo = async (
	req: IAuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = req.user as IUserDocument
		const deletedTodo = await TodoModel.findOneAndDelete({
			_id: req.params.todo,
			user: user.id,
		})

		if (!deletedTodo) {
			return next(new AppError('Todo not found.', 404))
		}

		deleteUserCache(req.user?.id as string)
		return res.status(200).json(deletedTodo)
	} catch (error) {
		return next(error)
	}
}

export const handleEmptyTrash = async (
	req: IAuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = req.user as IUserDocument
		const query: any = { user: user.id, status: EStatus.Trash }
		if (req.query.text) {
			query.$text = { $search: req.query.text }
		}

		const { deletedCount = 0 } = await TodoModel.deleteMany(query)
		deleteUserCache(req.user?.id as string)
		return res.status(200).send(deletedCount + ' tareas borradas')
	} catch (error) {
		return next(error)
	}
}

export const curateTodosQuery = (
	req: IAuthenticatedRequest,
	_: Response,
	next: NextFunction
) => {
	try {
		const query: IQuery = {
			match: { ...(req.query.match as any), user: req.user?.id },
			sort: (req.query.sort as string) || '-movedDate',
			page: parseInt((req.query.page as string) || '1'),
			pageSize: parseInt((req.query.pageSize as string) || '5'),
		}

		if (req.query.text) {
			query.match.$text = { $search: req.query.text as string }
		}

		// @ts-ignore
		req.query = query
		next()
	} catch (error) {
		return next(error)
	}
}

export interface IQuery {
	match: any
	sort: string
	page: number
	pageSize: number
}
