import {
	Schema,
	model,
	HookNextFunction,
	Document,
	Model,
	Types,
} from 'mongoose'
import brcrypt from 'bcryptjs'

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

const userSchema = new Schema(
	{
		nombre: {
			type: String,
			required: true,
			minlength: 2,
			maxlength: 40,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			match: new RegExp(
				/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
			),
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
	},
	{
		id: true,
		toObject: {
			virtuals: true,
			transform: (_: IUserDocument, obj: IUsuario) => ({
				...obj,
				password: undefined,
				_id: undefined,
				__v: undefined,
			}),
		},
	}
)

userSchema.pre('save', async function (
	this: IUserDocument,
	next: HookNextFunction
) {
	if (this.isModified('password')) {
		this.password = await brcrypt.hash(this.password, 8)
	}

	next()
})

export default model<IUserDocument, TUserModel>('User', userSchema)
export interface IUsuario {
	nombre: string
	email: string
	password: string
	fechaDeNacimiento?: Date
	sentiment?: ESentiment
}

export interface IUserDocument extends IUsuario, Document {
	id: string
}

export type TUserModel = Model<IUserDocument>

/* export interface ITest<T> {
	a: string
	b: number
	c: T
}

const test: ITest<IUsuario> = {
	a: 'hello',
	b: 3,
	c: {
		nombre: 'fdf',
		email: 'fsd',
		password: '323'
	}
} */
