import { ClaudeOptions, BatchResult } from './types';
export declare class ClaudeService {
    private client;
    constructor(apiKey?: string);
    private init;
    getDescription(imageUrl: string, { prompt, maxTokens, model }?: ClaudeOptions): Promise<string>;
    getDescriptionBatch(imageUrls: string[], options?: ClaudeOptions): Promise<BatchResult[]>;
}
export declare const claude: ClaudeService;
