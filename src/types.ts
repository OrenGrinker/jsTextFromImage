// src/types.ts
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