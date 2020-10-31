import Mailgun, { messages } from 'mailgun-js'
import env from '../env'

export default env.nodeEnv !== 'test'
	? new Mailgun({
			apiKey: env.mailGunApiKey,
			domain: 'sandbox27abd93a5ff84887bc8103d96fd46dc0.mailgun.org',
	  })
	: {
			send: jest.fn((_: messages.SendData) => {}),
			messages() {
				return {
					send: this.send,
				}
			},
	  }
