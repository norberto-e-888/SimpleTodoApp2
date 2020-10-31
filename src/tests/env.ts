import { config } from 'dotenv'

export default (): void => {
	config({ path: '.env.test' })
}
