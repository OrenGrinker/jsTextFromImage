import { OpenAIOptions, OpenAIBatchOptions, BatchImageResult } from './types';
export declare class OpenAIService {
    private client;
    constructor();
    init(apiKey: string): void;
    getDescription(imagePath: string, { prompt, maxTokens, model }?: OpenAIOptions): Promise<string>;
    getDescriptionBatch(imagePaths: string[], { prompt, maxTokens, model, concurrentLimit }?: OpenAIBatchOptions): Promise<BatchImageResult[]>;
}
export declare const openai: OpenAIService;
