"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.claude = void 0;
const sdk_1 = require("@anthropic-ai/sdk");
const utils_1 = require("./utils");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class ClaudeService {
    constructor() {
        this.client = null;
    }
    getValidMediaType(contentType) {
        const normalizedType = contentType.toLowerCase();
        switch (normalizedType) {
            case 'image/jpeg':
            case 'image/jpg':
                return 'image/jpeg';
            case 'image/png':
                return 'image/png';
            case 'image/gif':
                return 'image/gif';
            case 'image/webp':
                return 'image/webp';
            default:
                return 'image/jpeg'; // Default fallback
        }
    }
    init(apiKey = process.env.ANTHROPIC_API_KEY) {
        if (!apiKey) {
            throw new Error('Anthropic API key must be provided via apiKey parameter or ANTHROPIC_API_KEY environment variable.');
        }
        this.client = new sdk_1.Anthropic({ apiKey });
    }
    async getDescription(imagePath, { prompt = "What's in this image?", maxTokens = 300, model = 'claude-3-sonnet-20240229' } = {}) {
        if (!this.client) {
            this.init();
        }
        if (!this.client) {
            throw new Error('Client not initialized. Call init() first.');
        }
        try {
            const { encodedImage, contentType } = await (0, utils_1.getImageData)(imagePath);
            const validMediaType = this.getValidMediaType(contentType);
            const response = await this.client.messages.create({
                model,
                max_tokens: maxTokens,
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image',
                                source: {
                                    type: 'base64',
                                    media_type: validMediaType,
                                    data: encodedImage
                                }
                            },
                            {
                                type: 'text',
                                text: prompt
                            }
                        ]
                    }
                ]
            });
            if (!response.content[0]?.text) {
                throw new Error('No response content received from Claude');
            }
            return response.content[0].text;
        }
        catch (error) {
            throw new Error(`Claude API request failed: ${error.message}`);
        }
    }
    async getDescriptionBatch(imagePaths, { prompt = "What's in this image?", maxTokens = 300, model = 'claude-3-sonnet-20240229', concurrentLimit = 3 } = {}) {
        if (!this.client) {
            this.init();
        }
        return (0, utils_1.processBatchImages)(imagePaths, (imagePath) => this.getDescription(imagePath, { prompt, maxTokens, model }), concurrentLimit);
    }
}
exports.claude = new ClaudeService();
