"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openai = exports.OpenAIService = void 0;
// src/openai.ts
const openai_1 = __importDefault(require("openai"));
const batch_processor_1 = require("./batch-processor");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class OpenAIService {
    constructor(apiKey) {
        this.client = null;
        if (apiKey) {
            this.init(apiKey);
        }
    }
    init(apiKey = process.env.OPENAI_API_KEY) {
        if (!apiKey) {
            throw new Error('OpenAI API key must be provided via constructor or OPENAI_API_KEY environment variable.');
        }
        this.client = new openai_1.default({ apiKey });
    }
    async getDescription(imageUrl, { prompt = "What's in this image?", maxTokens = 300, model = 'gpt-4o' } = {}) {
        if (!this.client) {
            this.init();
        }
        try {
            const response = await this.client.chat.completions.create({
                model,
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt },
                            {
                                type: 'image_url',
                                image_url: { url: imageUrl }
                            }
                        ]
                    }
                ],
                max_tokens: maxTokens
            });
            if (!response.choices[0]?.message?.content) {
                throw new Error('No response content received from OpenAI');
            }
            return response.choices[0].message.content;
        }
        catch (error) {
            throw new Error(`OpenAI API request failed: ${error.message}`);
        }
    }
    async getDescriptionBatch(imageUrls, options = {}) {
        if (!this.client) {
            this.init();
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
exports.OpenAIService = OpenAIService;
exports.openai = new OpenAIService();
