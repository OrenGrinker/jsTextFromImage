// tests/claude.test.js
const { claude } = require('../src/claude');
const { getImageData } = require('../src/utils');

// Mock Anthropic client
jest.mock('@anthropic-ai/sdk', () => {
  return {
    Anthropic: jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn()
      }
    }))
  };
});

// Mock utils
jest.mock('../src/utils', () => ({
  getImageData: jest.fn()
}));

describe('Claude Module', () => {
  const mockApiKey = 'test-api-key';
  const mockImageUrl = 'https://example.com/image.jpg';
  const mockEncodedImage = 'base64-encoded-image';
  const mockDescription = 'This is a test description';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = mockApiKey;

    getImageData.mockResolvedValue({
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
    const { Anthropic } = require('@anthropic-ai/sdk');
    const mockAnthropicClient = new Anthropic();
    mockAnthropicClient.messages.create.mockResolvedValue({
      content: [{ text: mockDescription }]
    });

    claude.init(mockApiKey);
    const result = await claude.getDescription(mockImageUrl);

    expect(result).toBe(mockDescription);
    expect(getImageData).toHaveBeenCalledWith(mockImageUrl);
  });

  test('getDescription() should handle custom options', async () => {
    const { Anthropic } = require('@anthropic-ai/sdk');
    const mockAnthropicClient = new Anthropic();
    mockAnthropicClient.messages.create.mockResolvedValue({
      content: [{ text: mockDescription }]
    });

    const options = {
      prompt: 'Custom prompt',
      maxTokens: 500,
      model: 'custom-model'
    };

    claude.init(mockApiKey);
    const result = await claude.getDescription(mockImageUrl, options);

    expect(result).toBe(mockDescription);
    expect(mockAnthropicClient.messages.create).toHaveBeenCalledWith(
      expect.objectContaining({
        max_tokens: options.maxTokens,
        model: options.model
      })
    );
  });

  test('getDescription() should throw error on API failure', async () => {
    const { Anthropic } = require('@anthropic-ai/sdk');
    const mockAnthropicClient = new Anthropic();
    mockAnthropicClient.messages.create.mockRejectedValue(new Error('API Error'));

    claude.init(mockApiKey);
    await expect(claude.getDescription(mockImageUrl)).rejects.toThrow('Claude API request failed');
  });
});
