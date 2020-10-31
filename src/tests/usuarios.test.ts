import request from 'supertest'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { extractCookies, mailGunClient } from '../lib'
import { validAuthDto } from './data'
import { IUserModel } from '../content/user/model'

describe('/usuarios', () => {
	describe('POST /registrar', () => {
		it('Permite que un usuario se registre', async () => {
			await request(global.app)
				.post('/usuarios/registrar')
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
	})
})
