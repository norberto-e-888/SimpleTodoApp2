import { NextFunction, Request, Response } from 'express'
import { ObjectSchema } from 'joi'
import { AppError } from '.'

export default (
	schema: ObjectSchema,
	propertyToValidate: 'body' | 'query' | 'params'
) => (req: Request, _: Response, next: NextFunction) => {
	const result = schema.validate(req[propertyToValidate], { abortEarly: false })
	if (result.error) {
		const errors: { [key: string]: string } = {}
		result.error.details.forEach((detail) => {
			if (detail.context?.key) {
				errors[detail.context.key] = detail.message
			}
		})

		return next(new AppError(errors))
	}

	next()
}
