import { Router } from 'express'
import { UserController } from '../index'

export default (prefix?: string) => {
	const router = Router()
	const prefixedRouter = Router()
	router.route('/registrar').post(UserController.handleSignUp)
	router.route('/inicio').post(UserController.handleSignIn)
	return prefix ? prefixedRouter.use(prefix, router) : router
}
