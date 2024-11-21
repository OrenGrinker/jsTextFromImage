// src/claude.ts
import { Anthropic } from '@anthropic-ai/sdk';
import { getImageData } from './utils';
import { ClaudeOptions } from './types';
import dotenv from 'dotenv';

dotenv.config();

class ClaudeService {
  private client: Anthropic | null = null;

  init(apiKey: string = process.env.ANTHROPIC_API_KEY!): void {
    if (!apiKey) {
      throw new Error('Anthropic API key must be provided via apiKey parameter or ANTHROPIC_API_KEY environment variable.');
    }
    this.client = new Anthropic({ apiKey });
  }

  async getDescription(
    imageUrl: string,
    {
      prompt = "What's in this image?",
      maxTokens = 300,
      model = 'claude-3-sonnet-20240229'
    }: ClaudeOptions = {}
  ): Promise<string> {
    if (!this.client) {
      this.init();
    }

    const { encodedImage, contentType: rawContentType } = await getImageData(imageUrl);

    // Validate and normalize content type
    let contentType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
    switch (rawContentType.toLowerCase()) {
      case 'image/jpeg':
      case 'image/jpg':
        contentType = 'image/jpeg';
        break;
      case 'image/png':
        contentType = 'image/png';
        break;
      case 'image/gif':
        contentType = 'image/gif';
        break;
      case 'image/webp':
        contentType = 'image/webp';
        break;
      default:
        contentType = 'image/jpeg'; // Default to JPEG if unknown
    }

    try {
      const response = await this.client!.messages.create({
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
                  media_type: contentType,
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

      return response.content[0].text;
    } catch (error) {
      throw new Error(`Claude API request failed: ${(error as Error).message}`);
    }
  }
}

export const claude = new ClaudeService();