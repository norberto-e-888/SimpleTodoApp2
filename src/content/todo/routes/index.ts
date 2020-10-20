import { Router } from 'express'
import { TodoController } from '..'
import { extendBodyWithUserId } from '../../../lib'
import { UserController } from '../../user'

export default (prefix?: string) => {
	const prefixedRouter = Router()
	const todoRouter = Router()
	todoRouter.use(UserController.authenticate)
	todoRouter
		.route('/')
		.post(extendBodyWithUserId, TodoController.handleCreateTodo)

	return prefix ? prefixedRouter.use(prefix, todoRouter) : todoRouter
}
