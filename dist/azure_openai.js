"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.azureOpenai = void 0;
const openai_1 = require("openai");
const utils_1 = require("./utils");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class AzureOpenAIService {
    constructor() {
        this.client = null;
        this.deploymentName = '';
    }
    init({ apiKey = process.env.AZURE_OPENAI_API_KEY, endpoint = process.env.AZURE_OPENAI_ENDPOINT, deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT, apiVersion = '2024-07-01-preview' } = {}) {
        if (!apiKey || !endpoint || !deploymentName) {
            throw new Error('Azure OpenAI configuration must be provided via parameters or environment variables: AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_DEPLOYMENT');
        }
        this.deploymentName = deploymentName;
        this.client = new openai_1.AzureOpenAI({
            apiKey,
            endpoint,
            apiVersion,
            deployment: deploymentName,
        });
    }
    async getDescription(imagePath, { prompt = "What's in this image?", maxTokens = 300, systemPrompt = "You are a helpful assistant." } = {}) {
        if (!this.client) {
            this.init();
        }
        if (!this.client) {
            throw new Error('Client not initialized. Call init() first.');
        }
        try {
            const { encodedImage } = await (0, utils_1.getImageData)(imagePath);
            const completion = await this.client.chat.completions.create({
                model: this.deploymentName,
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
                                    url: `data:image/png;base64,${encodedImage}`
                                }
                            }
                        ]
                    }
                ],
                max_tokens: maxTokens
            });
            if (!completion.choices[0]?.message?.content) {
                throw new Error('No response content received from Azure OpenAI');
            }
            return completion.choices[0].message.content;
        }
        catch (error) {
            throw new Error(`Azure OpenAI API request failed: ${error.message}`);
        }
    }
    async getDescriptionBatch(imagePaths, { prompt = "What's in this image?", maxTokens = 300, systemPrompt = "You are a helpful assistant.", concurrentLimit = 3 } = {}) {
        if (!this.client) {
            this.init();
        }
        return (0, utils_1.processBatchImages)(imagePaths, (imagePath) => this.getDescription(imagePath, { prompt, maxTokens, systemPrompt }), concurrentLimit);
    }
}
exports.azureOpenai = new AzureOpenAIService();
