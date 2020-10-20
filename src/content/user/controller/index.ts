import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { AppError } from '../../../lib'
import UserModel, { IUserDocument, IUsuario } from '../model'

export const handleSignUp = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const doesUserAlreadyExist = !!(await UserModel.findOne({
			email: req.body.email,
		}))

		if (doesUserAlreadyExist) {
			throw Error(`Ya existe un usuario con email ${req.body.email}`)
		}

		const newUser = await UserModel.create(req.body)
		const authResult = await generateAuthenticationResult(newUser)
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

export const handleSignOut = async (_: Request, res: Response) => {
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
		.json(authResult.user)
}

export const generateJwt = async (user: IUsuario): Promise<string> => {
	return jwt.sign({ user }, process.env.JWT_SECRET as string) // type casting
	// cuando uno sabe más que el compilador sobre un tipado
}

export const generateAuthenticationResult = async (
	userDocument: IUserDocument
): Promise<IAuthenticationResult> => {
	const user = userDocument.toObject()
	const jwt = await generateJwt(user)
	return { user, jwt }
}

export const authenticate = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		/* 
		const c = 4
		const a = {
			b: 1,
			c: 2
		}
		const { b, c: c2 } = a */
		const { jwt: jwtCookie } = req.cookies
		if (!jwtCookie) {
			return next(new AppError('No estás autenticado', 401))
		}

		const { user } = jwt.verify(
			jwtCookie,
			process.env.JWT_SECRET as string
		) as {
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
		return next(error)
	}
}

declare module 'express' {
	interface Request {
		user?: IUserDocument
	}
}

export interface IAuthenticationResult {
	user: IUsuario
	jwt: string
}

export interface IAuthenticatedRequest extends Request {
	user?: IUserDocument
}
