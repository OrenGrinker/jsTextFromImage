import { OpenAIOptions, OpenAIBatchOptions, BatchImageResult } from './types';
declare class OpenAIService {
    private client;
    init(apiKey?: string): void;
    getDescription(imagePath: string, { prompt, maxTokens, model }?: OpenAIOptions): Promise<string>;
    getDescriptionBatch(imagePaths: string[], { prompt, maxTokens, model, concurrentLimit }?: OpenAIBatchOptions): Promise<BatchImageResult[]>;
}
export declare const openai: OpenAIService;
export {};
