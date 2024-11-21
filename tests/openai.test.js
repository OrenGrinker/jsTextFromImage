// tests/openai.test.js
const { openai } = require('../src/openai');
const { getImageData } = require('../src/utils');

// Mock the OpenAI client
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
  
  describe('OpenAI Module', () => {
    const mockApiKey = 'test-api-key';
    const mockImageUrl = 'https://example.com/image.jpg';
    const mockEncodedImage = 'base64-encoded-image';
    const mockDescription = 'This is a test description';
  
    beforeEach(() => {
      // Reset mocks before each test
      jest.clearAllMocks();
      process.env.OPENAI_API_KEY = mockApiKey;
  
      // Mock getImageData response
      getImageData.mockResolvedValue({
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
      // Mock OpenAI response
      const OpenAI = require('openai');
      const mockOpenAI = new OpenAI();
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: mockDescription } }]
      });
  
      openai.init(mockApiKey);
      const result = await openai.getDescription(mockImageUrl);
  
      expect(result).toBe(mockDescription);
      expect(getImageData).toHaveBeenCalledWith(mockImageUrl);
    });
  
    test('getDescription() should handle custom options', async () => {
      const OpenAI = require('openai');
      const mockOpenAI = new OpenAI();
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: mockDescription } }]
      });
  
      const options = {
        prompt: 'Custom prompt',
        maxTokens: 500,
        model: 'custom-model'
      };
  
      openai.init(mockApiKey);
      const result = await openai.getDescription(mockImageUrl, options);
  
      expect(result).toBe(mockDescription);
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          max_tokens: options.maxTokens,
          model: options.model
        })
      );
    });
  
    test('getDescription() should throw error on API failure', async () => {
      const OpenAI = require('openai');
      const mockOpenAI = new OpenAI();
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'));
  
      openai.init(mockApiKey);
      await expect(openai.getDescription(mockImageUrl)).rejects.toThrow('OpenAI API request failed');
    });
  });