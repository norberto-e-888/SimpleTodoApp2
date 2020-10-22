export default class AppError extends Error {
	error: string | object
	statusCode: number
	constructor(error: string | object, statusCode = 400) {
		super(typeof error === 'object' ? 'Error de validación' : error)
		this.error = error
		this.statusCode = statusCode
		Error.captureStackTrace(this, this.constructor)
	}
}
