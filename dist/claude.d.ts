import { ClaudeOptions } from './types';
declare class ClaudeService {
    private client;
    init(apiKey?: string): void;
    getDescription(imageUrl: string, { prompt, maxTokens, model }?: ClaudeOptions): Promise<string>;
}
export declare const claude: ClaudeService;
export {};
