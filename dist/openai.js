"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openai = void 0;
// src/openai.ts
const openai_1 = __importDefault(require("openai"));
const utils_1 = require("./utils");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class OpenAIService {
    constructor() {
        this.client = null;
    }
    init(apiKey = process.env.OPENAI_API_KEY) {
        if (!apiKey) {
            throw new Error('OpenAI API key must be provided via apiKey parameter or OPENAI_API_KEY environment variable.');
        }
        this.client = new openai_1.default({ apiKey });
    }
    async getDescription(imagePath, { prompt = "What's in this image?", maxTokens = 300, model = 'gpt-4-vision-preview' } = {}) {
        if (!this.client) {
            this.init();
        }
        if (!this.client) {
            throw new Error('Client not initialized. Call init() first.');
        }
        try {
            const { encodedImage } = await (0, utils_1.getImageData)(imagePath);
            const response = await this.client.chat.completions.create({
                model,
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt },
                            {
                                type: 'image_url',
                                image_url: { url: `data:image/png;base64,${encodedImage}` }
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
    async getDescriptionBatch(imagePaths, { prompt = "What's in this image?", maxTokens = 300, model = 'gpt-4-vision-preview', concurrentLimit = 3 } = {}) {
        if (!this.client) {
            this.init();
        }
        return (0, utils_1.processBatchImages)(imagePaths, (imagePath) => this.getDescription(imagePath, { prompt, maxTokens, model }), concurrentLimit);
    }
}
exports.openai = new OpenAIService();
