"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.azureOpenai = void 0;
// src/azure_openai.ts
const openai_1 = require("openai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class AzureOpenAIService {
    constructor() {
        this.client = null;
    }
    init({ apiKey = process.env.AZURE_OPENAI_API_KEY, endpoint = process.env.AZURE_OPENAI_ENDPOINT, deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT, apiVersion = '2024-07-01-preview' } = {}) {
        if (!apiKey || !endpoint || !deploymentName) {
            throw new Error('Azure OpenAI configuration must be provided via parameters or environment variables: AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_DEPLOYMENT');
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
            this.init();
        }
        if (!this.client) {
            throw new Error('Client not initialized. Call init() first.');
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
}
exports.azureOpenai = new AzureOpenAIService();
