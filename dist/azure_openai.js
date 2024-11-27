"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.azureOpenai = exports.AzureOpenAIService = void 0;
// src/azure_openai.ts
const openai_1 = require("openai");
const batch_processor_1 = require("./batch-processor");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class AzureOpenAIService {
    constructor(config) {
        this.client = null;
        if (config) {
            this.init(config);
        }
    }
    init({ apiKey = process.env.AZURE_OPENAI_API_KEY, endpoint = process.env.AZURE_OPENAI_ENDPOINT, deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT, apiVersion = '2024-07-01-preview' } = {}) {
        if (!apiKey || !endpoint || !deploymentName) {
            const missingParams = [];
            if (!apiKey)
                missingParams.push('apiKey');
            if (!endpoint)
                missingParams.push('endpoint');
            if (!deploymentName)
                missingParams.push('deploymentName');
            throw new Error(`Missing required Azure OpenAI configuration: ${missingParams.join(', ')}. ` +
                'These must be provided via constructor or environment variables.');
        }
        this.client = new openai_1.AzureOpenAI({
            apiKey,
            endpoint,
            apiVersion,
            deployment: deploymentName,
        });
    }
    async getDescription(imageUrl, { prompt = "What's in this image?", maxTokens = 300, systemPrompt = "You are a helpful assistant." } = {}) {
        if (!this.client) {
            this.init({});
        }
        try {
            const messages = {
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: prompt
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: imageUrl
                                }
                            }
                        ]
                    }
                ],
                model: "",
                max_tokens: maxTokens
            };
            const completion = await this.client.chat.completions.create(messages);
            if (!completion.choices[0]?.message?.content) {
                throw new Error('No response content received from Azure OpenAI');
            }
            return completion.choices[0].message.content;
        }
        catch (error) {
            throw new Error(`Azure OpenAI API request failed: ${error.message}`);
        }
    }
    async getDescriptionBatch(imageUrls, options = {}) {
        if (!this.client) {
            this.init({});
        }
        const concurrency = options.concurrency || 3;
        const processor = async (imageUrl) => {
            try {
                const description = await this.getDescription(imageUrl, options);
                return { imageUrl, description };
            }
            catch (error) {
                return {
                    imageUrl,
                    description: '',
                    error: error.message
                };
            }
        };
        return batch_processor_1.BatchProcessor.processBatch(imageUrls, processor, concurrency);
    }
}
exports.AzureOpenAIService = AzureOpenAIService;
exports.azureOpenai = new AzureOpenAIService();
