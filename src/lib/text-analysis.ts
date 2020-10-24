import {
	TextAnalyticsClient,
	AzureKeyCredential,
} from '@azure/ai-text-analytics'
import env from '../env'

export default new TextAnalyticsClient(
	env.azure.textAnalysisEndpoint,
	new AzureKeyCredential(env.azure.cognitiveServicesApiKey)
)
