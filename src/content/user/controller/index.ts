import { NextFunction, Request, Response } from 'express' // npm i -D @types/express
import UserModel from '../model'
// @types

// C, R (todos), R (por ID), U, D

export const handleSignUp = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		// info viene en el body de la consulta (req)
		const doesUserAlreadyExist = !!(await UserModel.findOne({
			email: req.body.email,
		}))

		if (doesUserAlreadyExist) {
			throw Error(`Ya existe un usuario con email ${req.body.email}`)
		}

		const newUser = await UserModel.create(req.body)
		return res.status(201).json(newUser)
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
	} catch (error) {
		return next(error)
	}
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
