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

	router
		.route('/yo')
		.get(UserController.authenticate, UserController.handleGetMe)

	router
		.route('/refresh-auth')
		.patch(
			UserController.authenticate,
			UserController.handleRefreshAuthentication
		)

	router
		.route('/verificar-correo/:code')
		.post(UserController.authenticate, UserController.handleVerifyEmail)

	return prefix ? prefixedRouter.use(prefix, router) : router
}
