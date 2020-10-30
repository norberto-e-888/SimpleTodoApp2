import { createClient } from 'redis'
import env from '../env'

export default env.nodeEnv === 'development' ? createClient() : undefined
