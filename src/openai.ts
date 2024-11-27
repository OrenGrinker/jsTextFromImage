// src/openai.ts
import OpenAI from 'openai';
import { OpenAIOptions, BatchResult } from './types';
import { BatchProcessor } from './batch-processor';
import dotenv from 'dotenv';
dotenv.config();

export class OpenAIService {
  private client: OpenAI | null = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.init(apiKey);
    }
  }

  private init(apiKey: string = process.env.OPENAI_API_KEY!): void {
    if (!apiKey) {
      throw new Error('OpenAI API key must be provided via constructor or OPENAI_API_KEY environment variable.');
    }
    this.client = new OpenAI({ apiKey });
  }

  async getDescription(
    imageUrl: string,
    {
      prompt = "What's in this image?",
      maxTokens = 300,
      model = 'gpt-4o'
    }: OpenAIOptions = {}
  ): Promise<string> {
    if (!this.client) {
      this.init();
    }

    try {
      const response = await this.client!.chat.completions.create({
        model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_tokens: maxTokens
      });

      if (!response.choices[0]?.message?.content) {
        throw new Error('No response content received from OpenAI');
      }

      return response.choices[0].message.content;
    } catch (error) {
      throw new Error(`OpenAI API request failed: ${(error as Error).message}`);
    }
  }

  async getDescriptionBatch(
    imageUrls: string[],
    options: OpenAIOptions = {}
  ): Promise<BatchResult[]> {
    if (!this.client) {
      this.init();
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

export const openai = new OpenAIService();