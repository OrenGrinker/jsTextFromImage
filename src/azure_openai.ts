// src/azure_openai.ts
import { AzureOpenAI } from "openai";
import type { ChatCompletionCreateParamsNonStreaming } from "openai/resources";
import { getImageData } from './utils';
import { AzureOpenAIOptions } from './types';
import dotenv from 'dotenv';

dotenv.config();

class AzureOpenAIService {
  private client: AzureOpenAI | null = null;

  init({
    apiKey = process.env.AZURE_OPENAI_API_KEY,
    endpoint = process.env.AZURE_OPENAI_ENDPOINT,
    deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT,
    apiVersion = '2024-07-01-preview'
  }: {
    apiKey?: string;
    endpoint?: string;
    deploymentName?: string;
    apiVersion?: string;
  } = {}): void {
    if (!apiKey || !endpoint || !deploymentName) {
      throw new Error(
        'Azure OpenAI configuration must be provided via parameters or environment variables: AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_DEPLOYMENT'
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
      this.init();
    }

    if (!this.client) {
      throw new Error('Client not initialized. Call init() first.');
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

      const completion = await this.client.chat.completions.create(messages);

      if (!completion.choices[0]?.message?.content) {
        throw new Error('No response content received from Azure OpenAI');
      }

      return completion.choices[0].message.content;
    } catch (error) {
      throw new Error(`Azure OpenAI API request failed: ${(error as Error).message}`);
    }
  }
}

export const azureOpenai = new AzureOpenAIService();