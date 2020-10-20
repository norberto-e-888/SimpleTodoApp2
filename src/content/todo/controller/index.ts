import { NextFunction, Response } from 'express'
import { TodoModel } from '..'
import { IAuthenticatedRequest } from '../../user/controller'

export const handleCreateTodo = async (
	req: IAuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const newTodo = await TodoModel.create(req.body)
		return res.status(201).json(newTodo.toObject())
	} catch (error) {
		return next(error)
	}
}
