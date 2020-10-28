import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { v1 as uuid } from 'uuid'
import bcrypt from 'bcryptjs'
import { AppError, mailGunClient } from '../../../lib'
import { IUserDocument, IUsuario } from '../model'
import { UserModel } from '..'
import env from '../../../env'

export const handleSignUp = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		await UserModel.isEmailInUse(req.body.email)
		const newUser = await UserModel.create(req.body)
		const authResult = await generateAuthenticationResult(newUser)
		const emailVerificationCode = await newUser.setCode(
			'emailVerificationCode',
			{ save: true, expiresIn: 1000 * 60 * 60 * 24 * 7 }
		)

		mailGunClient.messages().send({
			from: 'test@sandbox27abd93a5ff84887bc8103d96fd46dc0.mailgun.org',
			to: newUser.email,
			subject: 'Tu código de verificación - SimpleTodoApp',
			text: `Tu código de verificación: ${emailVerificationCode}`,
		})

		return sendAuthResponse(res, authResult, true)
	} catch (error) {
		return next(error)
	}
}

export const handleSignIn = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = await UserModel.findOne({
			email: req.body.email,
		})

		if (!user) {
			throw new Error('Credenciales inválidas')
		}

		const isPasswordValid = await bcrypt.compare(
			req.body.password,
			user.password
		)

		if (!isPasswordValid) {
			throw new Error('Credenciales inválidas')
		}

		const authResult = await generateAuthenticationResult(user)
		return sendAuthResponse(res, authResult)
	} catch (error) {
		return next(error)
	}
}

export const handleSignOut = async (req: Request, res: Response) => {
	await UserModel.findByIdAndUpdate(req.user?.id, { refreshToken: undefined })
	return res
		.clearCookie('jwt', {
			httpOnly: true,
			secure: false,
		})
		.end()
}

export const handleFetchById = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		// express route params
	} catch (error) {
		return next(error)
	}
}

export const handleGetMe = (req: Request, res: Response) => {
	return res.status(req.user ? 200 : 401).json(req.user)
}

export const handleVerifyEmail = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user?.emailVerificationCode?.value) {
			return next(new AppError('Usuario inválido'))
		}

		const isCodeExpired = req.user.emailVerificationCode.expiration < new Date()
		if (isCodeExpired) {
			return next(new AppError('Código expirado', 403))
		}

		const isCodeValid = await bcrypt.compare(
			req.params.code,
			req.user.emailVerificationCode.value
		)

		if (!isCodeValid) {
			return next(new AppError('Código inválido', 403))
		}

		req.user.isEmailVerified = true
		req.user.emailVerificationCode = undefined
		await req.user.save({ validateBeforeSave: false })
		return res.status(200).json(req.user.toObject())
	} catch (error) {
		return next(error)
	}
}

export const handleRecoverAccount = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = await UserModel.findOne({ email: req.params.email })
		if (!user) {
			throw new AppError('Cuenta no existe', 404)
		}

		const passwordResetCode = await user.setCode('passwordResetCode', {
			save: true,
			expiresIn: 1000 * 60 * 60 * 24,
		})

		mailGunClient.messages().send({
			from: 'test@sandbox27abd93a5ff84887bc8103d96fd46dc0.mailgun.org',
			to: user.email,
			subject: 'Tu código de recuperación de cuenta - SimpleTodoApp',
			text: `Tu código de recuperación de cuenta: ${passwordResetCode}`,
		})

		return res.send('Hemos enviado un código de recuperación a tu correo')
	} catch (error) {
		return next(error)
	}
}

export const handleResetPassword = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = await UserModel.findOne({
			email: req.params?.email,
		})

		if (!user) {
			return next(new AppError('Cuenta no existe'))
		}

		if (!user.passwordResetCode?.value) {
			return next(new AppError('Usuario inválido'))
		}

		const isCodeExpired = user.passwordResetCode.expiration < new Date()
		if (isCodeExpired) {
			return next(new AppError('Código expirado', 403))
		}

		const isCodeValid = await bcrypt.compare(
			req.params.code as string,
			user.passwordResetCode.value
		)

		if (!isCodeValid) {
			return next(new AppError('Código inválido', 403))
		}

		if (!req.body.password) {
			return next(new AppError('Necesitas incluir tu nueva contraseña'))
		}

		user.password = req.body.password
		user.passwordResetCode = undefined
		await user.save()
		const authResponse = await generateAuthenticationResult(user)
		return sendAuthResponse(res, authResponse)
	} catch (error) {
		return next(error)
	}
}

export const sendAuthResponse = (
	res: Response,
	authResult: IAuthenticationResult,
	isSignUp = false
) => {
	return res
		.status(isSignUp ? 201 : 200)
		.cookie('jwt', authResult.jwt, {
			httpOnly: true,
			secure: false,
		})
		.cookie('refreshToken', authResult.refreshToken, {
			httpOnly: true,
			secure: false,
		})
		.json(authResult.user)
}

export const generateJwt = async (user: IUsuario): Promise<string> => {
	return jwt.sign({ user }, env.auth.jwtSecret, { expiresIn: 60 * 15 }) // type casting
	// cuando uno sabe más que el compilador sobre un tipado
}

export const generateAuthenticationResult = async (
	userDocument: IUserDocument
): Promise<IAuthenticationResult> => {
	const user = userDocument
	const refreshToken = uuid()
	user.refreshToken = refreshToken
	await user.save({ validateBeforeSave: false })
	const jwt = await generateJwt(user.toObject())
	return {
		user: user.toObject(),
		jwt,
		refreshToken: await bcrypt.hash(refreshToken, 8),
	}
}

export const authenticate = async (
	req: Request,
	_: Response,
	next: NextFunction
) => {
	try {
		const { jwt: jwtCookie } = req.cookies
		if (!jwtCookie) {
			return next(new AppError('No estás autenticado', 401))
		}

		const { user } = jwt.verify(jwtCookie, env.auth.jwtSecret, {
			ignoreExpiration: ['/usuarios/refresh-auth'].includes(req.originalUrl),
		}) as {
			user: IUsuario
			iat: number
			exp: number
		}

		const userDocument = await UserModel.findById(user.id)
		if (!userDocument) {
			return next(new AppError('No estás autenticado', 401))
		}

		req.user = userDocument
		next()
	} catch (error) {
		return next(new AppError(error.error || error.message, 401))
	}
}

export const handleRefreshAuthentication = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.cookies.refreshToken || !req.user?.refreshToken) {
			return next(new AppError('No estás auntenticado', 401))
		}

		if (
			!bcrypt.compare(req.user.refreshToken as string, req.cookies.refreshToken)
		) {
			return next(new AppError('No estás auntenticado', 401))
		}

		const authResult = await generateAuthenticationResult(
			req.user as IUserDocument
		)

		return sendAuthResponse(res, authResult)
	} catch (error) {
		return next(error)
	}
}

export interface IAuthenticationResult {
	user: IUsuario
	jwt: string
	refreshToken: string
}

export interface IAuthenticatedRequest extends Request {
	user?: IUserDocument
}

declare module 'express' {
	interface Request {
		user?: IUserDocument
	}
}
