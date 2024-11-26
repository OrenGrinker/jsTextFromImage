export interface ImageData {
    encodedImage: string;
    contentType: string;
}
export interface BaseOptions {
    prompt?: string;
    maxTokens?: number;
}
export interface OpenAIOptions extends BaseOptions {
    model?: string;
}
export interface ClaudeOptions extends BaseOptions {
    model?: string;
}
export interface AzureOpenAIOptions extends BaseOptions {
    systemPrompt?: string;
}
export interface BatchProcessOptions {
    concurrentLimit?: number;
}
export interface BatchImageResult {
    success: boolean;
    description?: string;
    error?: string;
    imagePath: string;
}
export interface OpenAIBatchOptions extends OpenAIOptions, BatchProcessOptions {
}
export interface ClaudeBatchOptions extends ClaudeOptions, BatchProcessOptions {
}
export interface AzureOpenAIBatchOptions extends AzureOpenAIOptions, BatchProcessOptions {
}
