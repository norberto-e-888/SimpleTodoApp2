export default class AppError extends Error {
	error: string
	statusCode: number
	constructor(error: string, statusCode = 400) {
		super(error)
		this.error = error
		this.statusCode = statusCode
		Error.captureStackTrace(this, this.constructor)
	}
}
