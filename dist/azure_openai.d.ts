import { AzureOpenAIOptions } from './types';
declare class AzureOpenAIService {
    private client;
    init({ apiKey, endpoint, deploymentName, apiVersion }?: {
        apiKey?: string;
        endpoint?: string;
        deploymentName?: string;
        apiVersion?: string;
    }): void;
    getDescription(imageUrl: string, { prompt, maxTokens, systemPrompt }?: AzureOpenAIOptions): Promise<string>;
}
export declare const azureOpenai: AzureOpenAIService;
export {};
