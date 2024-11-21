"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDescription = exports.init = void 0;
// src/azure_openai.ts
const openai_1 = require("@azure/openai");
const utils_1 = require("./utils");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let client = null;
let deploymentName = null;
const init = ({ apiKey = process.env.AZURE_OPENAI_API_KEY, apiBase = process.env.AZURE_OPENAI_ENDPOINT, deploymentNameParam = process.env.AZURE_OPENAI_DEPLOYMENT, apiVersion = '2024-02-15-preview' } = {}) => {
    if (!apiKey || !apiBase || !deploymentNameParam) {
        throw new Error('Azure OpenAI configuration must be provided via parameters or environment variables: AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_DEPLOYMENT');
    }
    if (!apiBase.endsWith('/')) {
        apiBase += '/';
    }
    client = new openai_1.OpenAIClient(`${apiBase}openai/deployments/${deploymentNameParam}`, new openai_1.AzureKeyCredential(apiKey), { apiVersion });
    deploymentName = deploymentNameParam;
};
exports.init = init;
const getDescription = async (imageUrl, { prompt = "What's in this image?", maxTokens = 300, systemPrompt = "You are a helpful assistant." } = {}) => {
    if (!client || !deploymentName) {
        (0, exports.init)();
    }
    if (!client || !deploymentName) {
        throw new Error('Client not initialized. Call init() first.');
    }
    const { encodedImage } = await (0, utils_1.getImageData)(imageUrl);
    try {
        const messages = [
            {
                role: 'system',
                message: systemPrompt
            },
            {
                role: 'user',
                message: {
                    text: prompt,
                    image_url: { url: `data:image/png;base64,${encodedImage}` }
                }
            }
        ];
        const options = {
            messages,
            maxTokens: maxTokens
        };
        const response = await client.getChatCompletions(deploymentName, options);
        if (!response.choices.length || !response.choices[0].message?.content) {
            throw new Error('No response content received from Azure OpenAI');
        }
        return response.choices[0].message.content;
    }
    catch (error) {
        throw new Error(`Azure OpenAI API request failed: ${error.message}`);
    }
};
exports.getDescription = getDescription;
