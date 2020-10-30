import { Router } from 'express'
import { TodoController } from '..'
import { useChache } from '../../../cache'
import env from '../../../env'
import { extendBodyWithUserId, voidMiddleware } from '../../../lib'
import { UserController } from '../../user'

export default (prefix?: string) => {
	const prefixedRouter = Router()
	const todoRouter = Router()
	todoRouter.use(UserController.authenticate)
	todoRouter
		.route('/')
		.post(extendBodyWithUserId, TodoController.handleCreateTodo)
		.get(
			TodoController.curateTodosQuery,
			useChache,
			TodoController.handleFetchTodos
		)
		.delete(TodoController.handleEmptyTrash)

	todoRouter
		.route('/:todo')
		.patch(TodoController.handleUpdateTodo)
		.delete(TodoController.handleDeleteTodo)

	return prefix ? prefixedRouter.use(prefix, todoRouter) : todoRouter
}
