import { Router } from 'express'
import { TodoController } from '..'
import { useChache } from '../../../cache'
import { extendBodyWithUserId } from '../../../lib'
import { UserController } from '../../user'

export default (prefix?: string) => {
	const prefixedRouter = Router()
	const todoRouter = Router()
	todoRouter.use(UserController.authenticate)
	todoRouter
		.route('/')
		.post(extendBodyWithUserId, TodoController.handleCreateTodo)
		.get(useChache, TodoController.handleFetchTodos)

	return prefix ? prefixedRouter.use(prefix, todoRouter) : todoRouter
}
