import { Schema, model, HookNextFunction, Document, Model } from 'mongoose'
import brcrypt from 'bcryptjs'
import { validEmailRegEx } from '../../../constants'
import { MongooseSchemaDefinition } from '../../../typings'
import { AppError, generateCode } from '../../../lib'

export enum ESentiment {
	Positive = 'positive',
	Negative = 'negative',
	Neutral = 'neutral',
	Mixed = 'mixed',
}

export enum ELanguage {
	Español = 'es',
	Fránces = 'fr',
	Ingles = 'en',
}

const userCodeSchema = {
	value: String,
	expiration: Date,
}

const schemaDefinition: MongooseSchemaDefinition = {
	nombre: {
		type: String,
		required: true,
		minlength: 2,
		maxlength: 40,
		trim: true,
	},
	apellido: {
		type: String,
		required: true,
		minlength: 2,
		maxlength: 40,
		trim: true,
	},
	email: {
		type: String,
		required: true,
		match: validEmailRegEx,
		trim: true,
		unique: true,
	},
	password: {
		type: String,
		minlength: 8,
		maxlength: 16,
		trim: true,
		required: true,
	},
	fechaDeNacimiento: {
		type: Date,
	},
	sentiment: {
		type: String,
		enum: Object.values(ESentiment),
		default: ESentiment.Neutral,
	},
	language: {
		type: String,
		enum: Object.values(ELanguage),
		default: ELanguage.Español,
	},
	isEmailVerified: {
		type: Boolean,
		default: false,
	},
	emailVerificationCode: {
		type: userCodeSchema,
	},
	passwordResetCode: {
		type: userCodeSchema,
	},
	refreshToken: String,
}

const userSchema = new Schema(schemaDefinition, {
	id: true,
	toObject: {
		virtuals: true,
		transform: (_: IUserDocument, obj: IUsuario) => ({
			...obj,
			password: undefined,
			refreshToken: undefined,
			emailVerificationCode: undefined,
			passwordResetCode: undefined,
			_id: undefined,
			__v: undefined,
		}),
	},
})

userSchema.pre('save', async function (
	this: IUserDocument,
	next: HookNextFunction
) {
	if (this.isModified('password')) {
		this.password = await brcrypt.hash(this.password, 8)
	}

	next()
})

userSchema.statics.isEmailInUse = async function (
	this: IUserModel,
	email: string,
	{ throwIfExists = true }: IDoesEmailExistOptions = {
		throwIfExists: true,
	}
): Promise<boolean> {
	const user = await this.findOne({
		email,
	})

	if (user && throwIfExists) {
		throw new AppError(`"${email}" ya está en uso`, 400)
	}

	return !!user
}

userSchema.methods.setCode = async function (
	this: IUserDocument,
	property: TSetCodeProperties,
	{ save = true, expiresIn = 1000 * 60 * 60 }
): Promise<string> {
	const code = generateCode(6, { posibilidadesIguales: true, chars: 'Aa#' })
	const codeHash = await brcrypt.hash(code, 4)
	this[property] = {
		value: codeHash,
		expiration: new Date(Date.now() + expiresIn),
	}

	if (save) {
		await this.save({ validateBeforeSave: false })
	}

	return code
}

export default model<IUserDocument, IUserModel>('User', userSchema)
export interface IUsuario {
	id: string
	nombre: string
	apellido: string
	email: string
	password: string
	fechaDeNacimiento?: Date
	sentiment?: ESentiment
	language?: ELanguage
	isEmailVerified: boolean
	refreshToken?: string
	emailVerificationCode?: IUserCode
	passwordResetCode?: IUserCode
}

export interface IDoesEmailExistOptions {
	throwIfExists?: boolean
}

export interface IUserDocument extends IUsuario, Document {
	id: string
	setCode(
		property: TSetCodeProperties,
		options: ISetCodeOptions
	): Promise<string>
}

export interface IUserModel extends Model<IUserDocument> {
	isEmailInUse(email: string): Promise<boolean>
}

export interface IUserCode {
	value: string
	expiration: Date
}

interface ISetCodeOptions {
	save: boolean
	expiresIn: number
}

type TSetCodeProperties = 'emailVerificationCode' | 'passwordResetCode'
