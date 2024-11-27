// src/azure_openai.ts
import { AzureOpenAI } from "openai";
import type { ChatCompletionCreateParamsNonStreaming } from "openai/resources";
import { AzureOpenAIOptions, AzureOpenAIConfig, BatchResult } from './types';
import { BatchProcessor } from './batch-processor';
import dotenv from 'dotenv';
dotenv.config();

export class AzureOpenAIService {
  private client: AzureOpenAI | null = null;

  constructor(config?: AzureOpenAIConfig) {
    if (config) {
      this.init(config);
    }
  }

  private init({
    apiKey = process.env.AZURE_OPENAI_API_KEY,
    endpoint = process.env.AZURE_OPENAI_ENDPOINT,
    deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT,
    apiVersion = '2024-07-01-preview'
  }: AzureOpenAIConfig = {}): void {
    if (!apiKey || !endpoint || !deploymentName) {
      const missingParams = [];
      if (!apiKey) missingParams.push('apiKey');
      if (!endpoint) missingParams.push('endpoint');
      if (!deploymentName) missingParams.push('deploymentName');
      
      throw new Error(
        `Missing required Azure OpenAI configuration: ${missingParams.join(', ')}. ` +
        'These must be provided via constructor or environment variables.'
      );
    }

    this.client = new AzureOpenAI({
      apiKey,
      endpoint,
      apiVersion,
      deployment: deploymentName,
    });
  }

  async getDescription(
    imageUrl: string,
    {
      prompt = "What's in this image?",
      maxTokens = 300,
      systemPrompt = "You are a helpful assistant."
    }: AzureOpenAIOptions = {}
  ): Promise<string> {
    if (!this.client) {
      this.init({});
    }

    try {
      const messages: ChatCompletionCreateParamsNonStreaming = {
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        model: "",
        max_tokens: maxTokens
      };

      const completion = await this.client!.chat.completions.create(messages);
      
      if (!completion.choices[0]?.message?.content) {
        throw new Error('No response content received from Azure OpenAI');
      }

      return completion.choices[0].message.content;
    } catch (error) {
      throw new Error(`Azure OpenAI API request failed: ${(error as Error).message}`);
    }
  }

  async getDescriptionBatch(
    imageUrls: string[],
    options: AzureOpenAIOptions = {}
  ): Promise<BatchResult[]> {
    if (!this.client) {
      this.init({});
    }

    const concurrency = options.concurrency || 3;
    
    const processor = async (imageUrl: string): Promise<BatchResult> => {
      try {
        const description = await this.getDescription(imageUrl, options);
        return { imageUrl, description };
      } catch (error) {
        return {
          imageUrl,
          description: '',
          error: (error as Error).message
        };
      }
    };

    return BatchProcessor.processBatch(imageUrls, processor, concurrency);
  }
}

export const azureOpenai = new AzureOpenAIService();
