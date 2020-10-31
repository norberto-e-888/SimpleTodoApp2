import request from 'supertest'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { extractCookies, mailGunClient } from '../lib'
import { validAuthDto } from './data'
import { IUserModel } from '../content/user/model'

describe('/usuarios', () => {
	describe('POST /registrar', () => {
		const url = '/usuarios/registrar'
		it('Permite que un usuario se registre', async () => {
			await request(global.app)
				.post(url)
				.send(validAuthDto)
				.expect(201)
				.then(async (response) => {
					const {
						jwt: {
							value: jwtCookie,
							flags: { HttpOnly },
						},
					} = extractCookies(response.headers)

					const { user }: any = jwt.decode(jwtCookie)
					const UserModel = global.connection.model('User') as IUserModel
					const justCreatedUser = await UserModel.findOne({
						email: validAuthDto.email,
					})

					const justCreatedUserPlainObject = justCreatedUser?.toObject()
					expect(jwtCookie).toBeDefined()
					expect(HttpOnly).toBe(true)
					expect(justCreatedUser).not.toBeNull()
					expect(justCreatedUserPlainObject).toEqual(response.body)
					expect(user.password).toBeUndefined()
					expect(user.refreshToken).toBeUndefined()
					expect(user.emailVerificationCode).toBeUndefined()
					expect(user.passwordResetCode).toBeUndefined()
					expect(response.body.password).toBeUndefined()
					expect(response.body.refreshToken).toBeUndefined()
					expect(response.body.emailVerificationCode).toBeUndefined()
					expect(response.body.passwordResetCode).toBeUndefined()
					expect(mailGunClient.messages().send).toHaveBeenCalledTimes(1)
					expect(
						await bcrypt.compare(
							validAuthDto.password,
							justCreatedUser?.password as string
						)
					).toBe(true)
				})
		})

		it('Devuelve un 400 si el correo ya está en uso', async () => {
			await request(global.app).post(url).send(validAuthDto).expect(201)
			await request(global.app).post(url).send(validAuthDto).expect(400)
		})
	})
})

// tal input -> esperas tal output
// no pruebes detalles de implementación
// function A(x: number, y: string, z: user) => Promise<SomeOtherInterface>
// de nada sirve una prueba que no falla
// haz todo lo posible para hacerla fallar (se estricto/imaginativo de como pruebas que lo correcto haya pasado)
// rojo a verde
