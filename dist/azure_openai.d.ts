import { AzureOpenAIOptions, AzureOpenAIConfig, BatchResult } from './types';
export declare class AzureOpenAIService {
    private client;
    constructor(config?: AzureOpenAIConfig);
    private init;
    getDescription(imageUrl: string, { prompt, maxTokens, systemPrompt }?: AzureOpenAIOptions): Promise<string>;
    getDescriptionBatch(imageUrls: string[], options?: AzureOpenAIOptions): Promise<BatchResult[]>;
}
export declare const azureOpenai: AzureOpenAIService;
