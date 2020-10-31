import request from 'supertest'
import { IUserDocument, IUserModel } from '../../content/user/model'
import { IInicioDto, IRegistroDto } from '../../content/user/type'
import { extractCookies } from '../../lib'

export const mockSignUp = async (dto: IRegistroDto): Promise<IUserDocument> => {
	const User = global.connection.model('User') as IUserModel
	return await User.create<IRegistroDto>(dto)
}

export const authenticate = async (
	dto: IRegistroDto | IInicioDto,
	type: 'inicio' | 'registrar' = 'registrar'
) => {
	const response = await request(global.app)
		.post('/usuarios/' + type)
		.send(dto)
		.expect(type === 'registrar' ? 201 : 200)

	return extractCookies(response.headers)
}
