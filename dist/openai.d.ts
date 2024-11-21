import { OpenAIOptions } from './types';
declare class OpenAIService {
    private client;
    init(apiKey?: string): void;
    getDescription(imageUrl: string, { prompt, maxTokens, model }?: OpenAIOptions): Promise<string>;
}
export declare const openai: OpenAIService;
export {};
