"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.claude = exports.ClaudeService = void 0;
// src/claude.ts
const sdk_1 = require("@anthropic-ai/sdk");
const utils_1 = require("./utils");
const batch_processor_1 = require("./batch-processor");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class ClaudeService {
    constructor(apiKey) {
        this.client = null;
        if (apiKey) {
            this.init(apiKey);
        }
    }
    init(apiKey = process.env.ANTHROPIC_API_KEY) {
        if (!apiKey) {
            throw new Error('Anthropic API key must be provided via constructor or ANTHROPIC_API_KEY environment variable.');
        }
        this.client = new sdk_1.Anthropic({ apiKey });
    }
    async getDescription(imageUrl, { prompt = "What's in this image?", maxTokens = 300, model = 'claude-3-sonnet-20240229' } = {}) {
        if (!this.client) {
            this.init();
        }
        try {
            const { encodedImage, contentType: rawContentType } = await (0, utils_1.getImageData)(imageUrl);
            let contentType;
            switch (rawContentType.toLowerCase()) {
                case 'image/jpeg':
                case 'image/jpg':
                    contentType = 'image/jpeg';
                    break;
                case 'image/png':
                    contentType = 'image/png';
                    break;
                case 'image/gif':
                    contentType = 'image/gif';
                    break;
                case 'image/webp':
                    contentType = 'image/webp';
                    break;
                default:
                    contentType = 'image/jpeg';
            }
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
                                    media_type: contentType,
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
            return response.content[0].text;
        }
        catch (error) {
            throw new Error(`Claude API request failed: ${error.message}`);
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
exports.ClaudeService = ClaudeService;
exports.claude = new ClaudeService();
