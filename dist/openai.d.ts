import { OpenAIOptions, BatchResult } from './types';
export declare class OpenAIService {
    private client;
    constructor(apiKey?: string);
    private init;
    getDescription(imageUrl: string, { prompt, maxTokens, model }?: OpenAIOptions): Promise<string>;
    getDescriptionBatch(imageUrls: string[], options?: OpenAIOptions): Promise<BatchResult[]>;
}
export declare const openai: OpenAIService;
