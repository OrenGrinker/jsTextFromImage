import OpenAI from 'openai';
import { getImageData, processBatchImages } from './utils';
import { OpenAIOptions, OpenAIBatchOptions, BatchImageResult } from './types';
import dotenv from 'dotenv';
dotenv.config();

export class OpenAIService {
  private client: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.init(apiKey);
    }
  }

  public init(apiKey: string): void {
    if (!apiKey) {
      throw new Error('OpenAI API key must be provided via apiKey parameter or OPENAI_API_KEY environment variable.');
    }
    this.client = new OpenAI({ apiKey });
  }

  async getDescription(
    imagePath: string,
    {
      prompt = "What's in this image?",
      maxTokens = 300,
      model = 'gpt-4o'
    }: OpenAIOptions = {}
  ): Promise<string> {
    if (!this.client) {
      throw new Error('Client not initialized. Call init() first.');
    }

    try {
      const { encodedImage } = await getImageData(imagePath);

      const response = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: { url: `data:image/png;base64,${encodedImage}` }
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
    imagePaths: string[],
    {
      prompt = "What's in this image?",
      maxTokens = 300,
      model = 'gpt-4o',
      concurrentLimit = 3
    }: OpenAIBatchOptions = {}
  ): Promise<BatchImageResult[]> {
    if (!this.client) {
      throw new Error('Client not initialized. Call init() first.');
    }

    if (imagePaths.length > 20) {
      throw new Error('Maximum of 20 images allowed per batch request');
    }

    const results = await Promise.all(
      imagePaths.map(async (imagePath) => {
        try {
          const description = await this.getDescription(imagePath, {
            prompt,
            maxTokens,
            model
          });

          return {
            success: true,
            description,
            imagePath
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
            imagePath
          };
        }
      })
    );

    return results;
  }
}

export const openai = new OpenAIService();
