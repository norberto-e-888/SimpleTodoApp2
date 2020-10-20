import { NextFunction, Request, Response } from 'express'

export default (req: Request, _: Response, next: NextFunction) => {
	req.body = {
		...req.body,
		user: req.user?.id,
	}

	next()
}
