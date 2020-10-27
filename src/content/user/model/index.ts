import { Schema, model, HookNextFunction, Document, Model } from 'mongoose'
import brcrypt from 'bcryptjs'
import { validEmailRegEx } from '../../../constants'
import { MongooseSchemaDefinition } from '../../../typings'

/*
    ID           nombre   apellido  edad
19829389819234  norberto  cáceres   26

MONGO DB <--> SQL
Documentos vs Filas
Colleciones vs Tablas
Propiedades vs Columnas

Model Mongoose: Operaciones CRUD, enforzar un schema para la colleción
Relación 1 a 1 entre model y colección
*/
// string interface TS vs String clase JS -> number vs Number

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
	refreshToken: String,
	isEmailVerified: {
		type: Boolean,
		default: false,
	},
	emailVerificationToken: String,
	passwordResetCode: String,
}

const userSchema = new Schema(schemaDefinition, {
	id: true,
	toObject: {
		virtuals: true,
		transform: (_: IUserDocument, obj: IUsuario) => ({
			...obj,
			password: undefined,
			refreshToken: undefined,
			emailVerificationToken: undefined,
			passwordResetCode: undefined,
			_id: undefined,
			__v: undefined,
		}),
	},
})

userSchema.pre('validate', function (this: IUserDocument, next) {
	console.log('this.password', this.password)

	next()
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
		throw new Error(`"${email}" ya está en uso`)
	}

	return !!user
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
	refreshToken: string | null
	isEmailVerified: boolean
	emailVerificationToken: string | null
	passwordResetCode: string | null
} // de como se ve un JSON puro del usuario

export interface IDoesEmailExistOptions {
	throwIfExists?: boolean
}

export interface IUserDocument extends IUsuario, Document {
	id: string
}

export interface IUserModel extends Model<IUserDocument> {
	isEmailInUse(email: string): Promise<boolean>
}

/**
 * 	   	Más independiente
 *         Interfaces   Tipados de TS
 *         Model        Schema de Mongoose
 *         Repositorio  Ignorante de lógica de negocio, solo conoce la interface de BD expresada en términos CRUD (Módelo Mongoose sirve en efecto de repositorio)
 *         Service      Ignorante de HTTP y solo generación de lógica de negocio
 * 		   Controlador  Conoce el contexto HTTP (handlers)
 *         API       Curan, filtran, defines parámetros, y mapean a controladores a las consultas HTTP
 *      Más dependiente
 */
