import { SchemaDefinition, SchemaTypeOpts } from 'mongoose'

export type MongooseSchemaDefinition<T> = {
	[K in keyof Required<
		Omit<T, 'timestamps' | 'createdAt' | 'updatedAt' | 'id'>
	>]: SchemaDefinition | SchemaTypeOpts<any>
}
