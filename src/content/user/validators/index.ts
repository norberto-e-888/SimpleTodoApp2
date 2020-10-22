import joi from 'joi'
import { validEmailRegEx } from '../../../constants'

export const validateSignUpBody = joi.object({
	nombre: joi.string().alphanum().min(2).max(40).required(),
	apellido: joi.string().alphanum().min(2).max(40).required(),
	email: joi.string().regex(validEmailRegEx).required(),
	password: joi.string().min(8).max(60).required(),
	fechaDeNacimiento: joi.date() /* .validate((value: string) => {
		const date = new Date(value)
		const year = date.getFullYear()
		return new Date().getFullYear() - year >= 15
    }), */,
})
