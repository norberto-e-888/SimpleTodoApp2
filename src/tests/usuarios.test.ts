import request from 'supertest'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { extractCookies, mailGunClient } from '../lib'
import { validSignUpDto, validSignInDto } from './data'
import { IUserModel } from '../content/user/model'
import { mockSignUp } from './helpers'

describe('/usuarios', () => {
	describe('POST /registrar', () => {
		const url = '/usuarios/registrar'
		it('Permite que un usuario se registre', async () => {
			await request(global.app)
				.post(url)
				.send(validSignUpDto)
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
						email: validSignUpDto.email,
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
							validSignUpDto.password,
							justCreatedUser?.password as string
						)
					).toBe(true)
				})
		})

		it('Devuelve un 400 si el correo ya está en uso', async () => {
			await request(global.app).post(url).send(validSignUpDto).expect(201)
			await request(global.app).post(url).send(validSignUpDto).expect(400)
		})
	})

	describe('POST /inicio', () => {
		const url = '/usuarios/inicio'
		it('Permite que un usuario existente se autentique', async () => {
			await mockSignUp(validSignUpDto)
			await request(global.app).post(url).send(validSignInDto).expect(200)
		})

		it('Devuelve un 400 cuando las credenciales son inválidas', async () => {
			await request(global.app).post(url).send(validSignInDto).expect(400)
			await mockSignUp(validSignUpDto)
			await request(global.app)
				.post(url)
				.send({
					...validSignInDto,
					password: validSignInDto.password + 'not-valid',
				})
				.expect(400)
		})
	})
})
