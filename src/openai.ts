// src/openai.ts
import OpenAI from 'openai';
import { getImageData } from './utils';
import { OpenAIOptions } from './types';
import dotenv from 'dotenv';

dotenv.config();

class OpenAIService {
  private client: OpenAI | null = null;

  init(apiKey: string = process.env.OPENAI_API_KEY!): void {
    if (!apiKey) {
      throw new Error('OpenAI API key must be provided via apiKey parameter or OPENAI_API_KEY environment variable.');
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

    if (!this.client) {
      throw new Error('Client not initialized. Call init() first.');
    }

    const { encodedImage } = await getImageData(imageUrl);

    try {
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
}

export const openai = new OpenAIService();