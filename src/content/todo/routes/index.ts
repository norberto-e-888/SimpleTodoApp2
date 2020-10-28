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
