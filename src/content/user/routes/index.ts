import { Router } from 'express'
import { validateRequest } from '../../../lib'
import { UserController } from '../index'
import { validateSignUpBody } from '../validators'

export default (prefix?: string) => {
	const router = Router()
	const prefixedRouter = Router()
	router
		.route('/registrar')
		.post(
			validateRequest(validateSignUpBody, 'body'),
			UserController.handleSignUp
		)

	router.route('/inicio').post(UserController.handleSignIn)
	router
		.route('/salir')
		.post(UserController.authenticate, UserController.handleSignOut)

	return prefix ? prefixedRouter.use(prefix, router) : router
}
