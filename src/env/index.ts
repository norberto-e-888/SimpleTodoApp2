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

const azure = {
	textAnalysisEndpoint,
	cognitiveServicesApiKey,
}

const port = parseInt(process.env.PORT || '3000')
export default {
	auth: {
		jwtSecret,
	},
	db: {
		mongoUri,
	},
	nodeEnv,
	port,
	clientUrl,
	azure,
}
