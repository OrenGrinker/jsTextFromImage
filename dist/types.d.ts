export interface ImageData {
    encodedImage: string;
    contentType: string;
}
export interface BatchResult {
    imageUrl: string;
    description: string;
    error?: string;
}
export interface BaseOptions {
    prompt?: string;
    maxTokens?: number;
    concurrency?: number;
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
export interface AzureOpenAIConfig {
    apiKey?: string;
    endpoint?: string;
    deploymentName?: string;
    apiVersion?: string;
}
