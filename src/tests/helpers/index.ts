import request from 'supertest'
import { IUserDocument, IUserModel } from '../../content/user/model'
import { extractCookies } from '../../lib'

export const mockSignUp = async (dto: any): Promise<IUserDocument> => {
	const User = global.connection.model('User') as IUserModel
	return await User.create(dto)
}

export const authenticate = async (
	dto: any,
	type: 'inicio' | 'registrar' = 'registrar'
) => {
	const response = await request(global.app)
		.post('/usuarios/' + type)
		.send(dto)
		.expect(type === 'registrar' ? 201 : 200)

	return extractCookies(response.headers)
}
