import {
	Schema,
	model,
	Types,
	Document,
	Model,
	HookNextFunction,
	UpdateQuery,
} from 'mongoose'

export enum EStatus {
	Pending = 'pending',
	Completed = 'completed',
	Trash = 'trash',
}

const todoSchema = new Schema(
	{
		body: {
			type: String,
			required: true,
			maxlength: 500,
		},
		status: {
			type: String,
			enum: Object.values(EStatus), // ['pending', 'completed', 'trash'],
			default: EStatus.Pending,
		},
		user: {
			type: Types.ObjectId,
			ref: 'User',
			required: true,
		},
		movedDate: {
			type: Date,
			default: () => new Date(),
		},
	},
	{
		id: true,
		toObject: {
			virtuals: true,
			transform: (_: ITodoDocument, obj: ITodo) => ({
				...obj,
				_id: undefined,
				__v: undefined,
			}),
		},
		timestamps: {
			createdAt: true,
			updatedAt: true,
		},
	}
)

todoSchema.index({ body: 'text' })

todoSchema.pre('findOneAndUpdate', function (
	this: UpdateQuery<ITodoDocument>,
	next: HookNextFunction
) {
	if (this._update.status) {
		this._update.movedDate = new Date()
	}

	next()
})

export default model<ITodoDocument, TTodoModel>('Todo', todoSchema)

export interface ITodo {
	id: string
	body: string
	user: string
	movedDate: Date
	createdAt: Date
	updatedAt: Date
}

export interface ITodoDocument extends ITodo, Document {
	id: string
}

export type TTodoModel = Model<ITodoDocument>
