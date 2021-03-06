import joi from 'joi'
import { validEmailRegEx } from '../../../constants'

export const validateSignUpBody = joi.object({
	nombre: joi.string().min(2).max(40).required().messages({
		'string.min': 'El nombre debe tener mínimo 2 caracteres',
		'string.max': 'El nombre no puede tener más de 40 caracteres',
	}),
	apellido: joi.string().min(2).max(40).required(),
	email: joi.string().regex(validEmailRegEx).required(),
	password: joi.string().min(8).max(60).required(),
	fechaDeNacimiento: joi.date(),
})
