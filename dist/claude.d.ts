import { ClaudeOptions, ClaudeBatchOptions, BatchImageResult } from './types';
declare class ClaudeService {
    private client;
    private getValidMediaType;
    init(apiKey?: string): void;
    getDescription(imagePath: string, { prompt, maxTokens, model }?: ClaudeOptions): Promise<string>;
    getDescriptionBatch(imagePaths: string[], { prompt, maxTokens, model, concurrentLimit }?: ClaudeBatchOptions): Promise<BatchImageResult[]>;
}
export declare const claude: ClaudeService;
export {};
