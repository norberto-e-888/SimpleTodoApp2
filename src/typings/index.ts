import { SchemaDefinition, SchemaTypeOpts } from 'mongoose'
import { IUsuario } from '../content/user/model'

export type MongooseSchemaDefinition = {
	[K in keyof Required<Omit<IUsuario, 'timestamps' | 'id'>>]:
		| SchemaDefinition
		| SchemaTypeOpts<any>
}
