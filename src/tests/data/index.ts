import { IInicioDto, IRegistroDto } from '../../content/user/type'

export const validEmail = 'test@email.com'
export const invalidEmail = 'invalid'
export const validPassword = '12345678'
export const invalidPassword = '1234567'
export const validAuthDto: IRegistroDto = {
	email: validEmail,
	password: validPassword,
	nombre: 'Norberto',
	apellido: 'Cáceres',
}

export const invalidAuthDto: IRegistroDto = {
	email: invalidEmail,
	password: invalidPassword,
	nombre: 'Norberto',
	apellido: 'Cáceres',
}

export const incompleteAuthDto: Omit<IRegistroDto, 'password' | 'email'> = {
	nombre: 'Norberto',
	apellido: 'Cáceres',
}

export const validSignInDto: IInicioDto = {
	email: validEmail,
	password: validPassword,
}
