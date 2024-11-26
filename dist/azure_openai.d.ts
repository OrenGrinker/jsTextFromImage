import { AzureOpenAIOptions, AzureOpenAIBatchOptions, BatchImageResult } from './types';
declare class AzureOpenAIService {
    private client;
    private deploymentName;
    init({ apiKey, endpoint, deploymentName, apiVersion }?: {
        apiKey?: string;
        endpoint?: string;
        deploymentName?: string;
        apiVersion?: string;
    }): void;
    getDescription(imagePath: string, { prompt, maxTokens, systemPrompt }?: AzureOpenAIOptions): Promise<string>;
    getDescriptionBatch(imagePaths: string[], { prompt, maxTokens, systemPrompt, concurrentLimit }?: AzureOpenAIBatchOptions): Promise<BatchImageResult[]>;
}
export declare const azureOpenai: AzureOpenAIService;
export {};
