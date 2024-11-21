import { AzureOpenAIConfig, AzureOpenAIOptions } from './types';
export declare const init: ({ apiKey, apiBase, deploymentNameParam, apiVersion }?: AzureOpenAIConfig) => void;
export declare const getDescription: (imageUrl: string, { prompt, maxTokens, systemPrompt }?: AzureOpenAIOptions) => Promise<string>;
