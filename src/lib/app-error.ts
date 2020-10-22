export default class AppError extends Error {
	error: string | object
	validationErrors: any
	statusCode: number
	constructor(error: string, validationErrors: any, statusCode = 400) {
		super(error)
		this.error = error
		this.validationErrors = validationErrors
		this.statusCode = statusCode
		Error.captureStackTrace(this, this.constructor)
	}
}
