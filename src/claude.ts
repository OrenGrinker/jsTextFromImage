import { Anthropic } from '@anthropic-ai/sdk';
import { getImageData, processBatchImages } from './utils';
import { ClaudeOptions, ClaudeBatchOptions, BatchImageResult } from './types';
import dotenv from 'dotenv';
dotenv.config();

type ValidMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

class ClaudeService {
  private client: Anthropic | null = null;

  private getValidMediaType(contentType: string): ValidMediaType {
    const normalizedType = contentType.toLowerCase();
    switch (normalizedType) {
      case 'image/jpeg':
      case 'image/jpg':
        return 'image/jpeg';
      case 'image/png':
        return 'image/png';
      case 'image/gif':
        return 'image/gif';
      case 'image/webp':
        return 'image/webp';
      default:
        return 'image/jpeg'; // Default fallback
    }
  }

  init(apiKey: string = process.env.ANTHROPIC_API_KEY!): void {
    if (!apiKey) {
      throw new Error('Anthropic API key must be provided via apiKey parameter or ANTHROPIC_API_KEY environment variable.');
    }
    this.client = new Anthropic({ apiKey });
  }

  async getDescription(
    imagePath: string,
    {
      prompt = "What's in this image?",
      maxTokens = 300,
      model = 'claude-3-sonnet-20240229'
    }: ClaudeOptions = {}
  ): Promise<string> {
    if (!this.client) {
      this.init();
    }

    if (!this.client) {
      throw new Error('Client not initialized. Call init() first.');
    }

    try {
      const { encodedImage, contentType } = await getImageData(imagePath);
      const validMediaType = this.getValidMediaType(contentType);

      const response = await this.client.messages.create({
        model,
        max_tokens: maxTokens,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: validMediaType,
                  data: encodedImage
                }
              },
              {
                type: 'text',
                text: prompt
              }
            ]
          }
        ]
      });

      if (!response.content[0]?.text) {
        throw new Error('No response content received from Claude');
      }

      return response.content[0].text;
    } catch (error) {
      throw new Error(`Claude API request failed: ${(error as Error).message}`);
    }
  }

  async getDescriptionBatch(
    imagePaths: string[],
    {
      prompt = "What's in this image?",
      maxTokens = 300,
      model = 'claude-3-sonnet-20240229',
      concurrentLimit = 3
    }: ClaudeBatchOptions = {}
  ): Promise<BatchImageResult[]> {
    if (!this.client) {
      this.init();
    }

    return processBatchImages(
      imagePaths,
      (imagePath: string) => this.getDescription(imagePath, { prompt, maxTokens, model }),
      concurrentLimit
    );
  }
}

export const claude = new ClaudeService();