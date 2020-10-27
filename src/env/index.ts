const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) {
	throw Error('JWT_SECRET debe estar definido')
}

const mongoUri = process.env.MONGO_URI
if (!mongoUri) {
	throw Error('MONGO_URI debe estar definido')
}

const nodeEnv = process.env.NODE_ENV
if (!nodeEnv) {
	throw Error('NODE_ENV debe estar definido')
}

const clientUrl = process.env.CLIENT_URL
if (!clientUrl) {
	throw Error('CLIENT_URL debe estar definido')
}

const textAnalysisEndpoint = process.env.AZURE_TEXT_ANALYSIS_ENDPOINT
const cognitiveServicesApiKey = process.env.AZURE_COGNITIVE_SERVICES_API_KEY
if (!textAnalysisEndpoint || !cognitiveServicesApiKey) {
	throw Error(
		'Configuraciones de Azure text analysis incompletas (endpoint y api key)'
	)
}

const processTextEveryNMilliseconds = parseInt(
	process.env.PROCESS_TEXT_EVERY_N_MILLISECONDS || '300000'
)

if (processTextEveryNMilliseconds < 60000) {
	throw Error(
		'PROCESS_TEXT_EVERY_N_MILLISECONDS debe ser mayor o igual a 60,000'
	)
}

const sendCompletedToTrashAfterNMilliseconds = parseInt(
	process.env.SEND_TO_TRASH_AFTER_N_MILLISECONDS || '302400000'
)

if (sendCompletedToTrashAfterNMilliseconds < 86400000) {
	throw Error('SEND_TO_TRASH_AFTER_N_MILLISECONDS debe ser mayor que 86400000')
}

const deleteAfterNMillisecondsInTrash = parseInt(
	process.env.DELETE_AFTER_N_MILLISECONDS_IN_TRASH || '604800000'
)

if (deleteAfterNMillisecondsInTrash < 86400000) {
	throw Error(
		'DELETE_AFTER_N_MILLISECONDS_IN_TRASH debe ser mayor que 86400000'
	)
}

const azure = {
	textAnalysisEndpoint,
	cognitiveServicesApiKey,
	processTextEveryNMilliseconds,
}

const jwtExpirationInSeconds = parseInt(
	process.env.JWT_EXPIRY_IN_SECONDS || (1000 * 60 * 15).toString()
)

const port = parseInt(process.env.PORT || '3000')
export default {
	auth: {
		jwtSecret,
		jwtExpirationInSeconds,
	},
	db: {
		mongoUri,
	},
	nodeEnv,
	port,
	clientUrl,
	azure,
	todos: {
		sendCompletedToTrashAfterNMilliseconds,
		deleteAfterNMillisecondsInTrash,
	},
}
