// tests/claude.test.ts
import { Anthropic } from '@anthropic-ai/sdk';
import { claude } from '../src/claude';
import { getImageData } from '../src/utils';
import { ClaudeOptions } from '../src/types';

// Mock Anthropic client
jest.mock('@anthropic-ai/sdk', () => ({
  Anthropic: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn()
    }
  }))
}));

// Mock utils
jest.mock('../src/utils', () => ({
  getImageData: jest.fn()
}));

describe('Claude Service', () => {
  const mockApiKey = 'test-api-key';
  const mockImageUrl = 'https://example.com/image.jpg';
  const mockEncodedImage = 'base64-encoded-image';
  const mockDescription = 'This is a test description';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = mockApiKey;
    (getImageData as jest.Mock).mockResolvedValue({
      encodedImage: mockEncodedImage,
      contentType: 'image/jpeg'
    });
  });

  test('init() should initialize client with API key', () => {
    claude.init(mockApiKey);
    expect(claude.getDescription).toBeDefined();
  });

  test('init() should use environment variable if no API key provided', () => {
    claude.init();
    expect(claude.getDescription).toBeDefined();
  });

  test('init() should throw error if no API key available', () => {
    delete process.env.ANTHROPIC_API_KEY;
    expect(() => claude.init()).toThrow();
  });

  test('getDescription() should return image description', async () => {
    const mockCreate = jest.fn().mockResolvedValue({
      content: [{ text: mockDescription }]
    });

    (Anthropic as jest.MockedClass<typeof Anthropic>).mockImplementation(() => ({
      messages: { create: mockCreate }
    } as any));

    claude.init(mockApiKey);
    const result = await claude.getDescription(mockImageUrl);
    
    expect(result).toBe(mockDescription);
    expect(getImageData).toHaveBeenCalledWith(mockImageUrl);
  });

  test('getDescription() should handle custom options', async () => {
    const mockCreate = jest.fn().mockResolvedValue({
      content: [{ text: mockDescription }]
    });

    (Anthropic as jest.MockedClass<typeof Anthropic>).mockImplementation(() => ({
      messages: { create: mockCreate }
    } as any));

    const options: ClaudeOptions = {
      prompt: 'Custom prompt',
      maxTokens: 500,
      model: 'custom-model'
    };

    claude.init(mockApiKey);
    const result = await claude.getDescription(mockImageUrl, options);
    
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

    (Anthropic as jest.MockedClass<typeof Anthropic>).mockImplementation(() => ({
      messages: { create: mockCreate }
    } as any));

    claude.init(mockApiKey);
    await expect(claude.getDescription(mockImageUrl)).rejects.toThrow('Claude API request failed');
  });
});