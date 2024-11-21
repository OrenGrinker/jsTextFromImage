// tests/openai.test.ts
import OpenAI from 'openai';
import { openai } from '../src/openai';
import { getImageData } from '../src/utils';
import { OpenAIOptions } from '../src/types';

// Mock OpenAI client
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn()
      }
    }
  }));
});

// Mock utils
jest.mock('../src/utils', () => ({
  getImageData: jest.fn()
}));

describe('OpenAI Service', () => {
  const mockApiKey = 'test-api-key';
  const mockImageUrl = 'https://example.com/image.jpg';
  const mockEncodedImage = 'base64-encoded-image';
  const mockDescription = 'This is a test description';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OPENAI_API_KEY = mockApiKey;
    (getImageData as jest.Mock).mockResolvedValue({
      encodedImage: mockEncodedImage,
      contentType: 'image/jpeg'
    });
  });

  test('init() should initialize client with API key', () => {
    openai.init(mockApiKey);
    expect(openai.getDescription).toBeDefined();
  });

  test('init() should use environment variable if no API key provided', () => {
    openai.init();
    expect(openai.getDescription).toBeDefined();
  });

  test('init() should throw error if no API key available', () => {
    delete process.env.OPENAI_API_KEY;
    expect(() => openai.init()).toThrow();
  });

  test('getDescription() should return image description', async () => {
    const mockCreate = jest.fn().mockResolvedValue({
      choices: [{ message: { content: mockDescription } }]
    });

    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
      chat: { completions: { create: mockCreate } }
    } as any));

    openai.init(mockApiKey);
    const result = await openai.getDescription(mockImageUrl);
    
    expect(result).toBe(mockDescription);
    expect(getImageData).toHaveBeenCalledWith(mockImageUrl);
  });

  test('getDescription() should handle custom options', async () => {
    const mockCreate = jest.fn().mockResolvedValue({
      choices: [{ message: { content: mockDescription } }]
    });

    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
      chat: { completions: { create: mockCreate } }
    } as any));

    const options: OpenAIOptions = {
      prompt: 'Custom prompt',
      maxTokens: 500,
      model: 'custom-model'
    };

    openai.init(mockApiKey);
    const result = await openai.getDescription(mockImageUrl, options);
    
    expect(result).toBe(mockDescription);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        max_tokens: options.maxTokens,
        model: options.model
      })
    );
  });

  test('getDescription() should throw error on API failure', async () => {
    const mockCreate = jest.fn().mockRejectedValue(new Error('API Error'));

    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
      chat: { completions: { create: mockCreate } }
    } as any));

    openai.init(mockApiKey);
    await expect(openai.getDescription(mockImageUrl)).rejects.toThrow('OpenAI API request failed');
  });
});