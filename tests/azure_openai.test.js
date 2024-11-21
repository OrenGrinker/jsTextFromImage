// tests/azure_openai.test.js
const { azureOpenai } = require('../src/azure_openai');
const { getImageData } = require('../src/utils');

// Mock Azure OpenAI client
jest.mock('@azure/openai', () => {
  return {
    OpenAIClient: jest.fn().mockImplementation(() => ({
      getChatCompletions: jest.fn()
    })),
    AzureKeyCredential: jest.fn()
  };
});

// Mock utils
jest.mock('../src/utils', () => ({
  getImageData: jest.fn()
}));

describe('Azure OpenAI Module', () => {
  const mockConfig = {
    apiKey: 'test-api-key',
    apiBase: 'https://test.openai.azure.com/',
    deploymentName: 'test-deployment'
  };
  const mockImageUrl = 'https://example.com/image.jpg';
  const mockEncodedImage = 'base64-encoded-image';
  const mockDescription = 'This is a test description';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AZURE_OPENAI_API_KEY = mockConfig.apiKey;
    process.env.AZURE_OPENAI_ENDPOINT = mockConfig.apiBase;
    process.env.AZURE_OPENAI_DEPLOYMENT = mockConfig.deploymentName;

    getImageData.mockResolvedValue({
      encodedImage: mockEncodedImage,
      contentType: 'image/jpeg'
    });
  });

  test('init() should initialize client with config', () => {
    azureOpenai.init(mockConfig);
    expect(azureOpenai.getDescription).toBeDefined();
  });

  test('init() should use environment variables if no config provided', () => {
    azureOpenai.init();
    expect(azureOpenai.getDescription).toBeDefined();
  });

  test('init() should throw error if no config available', () => {
    delete process.env.AZURE_OPENAI_API_KEY;
    expect(() => azureOpenai.init()).toThrow();
  });

  test('getDescription() should return image description', async () => {
    const { OpenAIClient } = require('@azure/openai');
    const mockAzureClient = new OpenAIClient();
    mockAzureClient.getChatCompletions.mockResolvedValue({
      choices: [{ message: { content: mockDescription } }]
    });

    azureOpenai.init(mockConfig);
    const result = await azureOpenai.getDescription(mockImageUrl);

    expect(result).toBe(mockDescription);
    expect(getImageData).toHaveBeenCalledWith(mockImageUrl);
  });

  test('getDescription() should handle custom options', async () => {
    const { OpenAIClient } = require('@azure/openai');
    const mockAzureClient = new OpenAIClient();
    mockAzureClient.getChatCompletions.mockResolvedValue({
      choices: [{ message: { content: mockDescription } }]
    });

    const options = {
      prompt: 'Custom prompt',
      maxTokens: 500,
      systemPrompt: 'Custom system prompt'
    };

    azureOpenai.init(mockConfig);
    const result = await azureOpenai.getDescription(mockImageUrl, options);

    expect(result).toBe(mockDescription);
    expect(mockAzureClient.getChatCompletions).toHaveBeenCalledWith(
      mockConfig.deploymentName,
      expect.objectContaining({
        max_tokens: options.maxTokens
      })
    );
  });

  test('getDescription() should throw error on API failure', async () => {
    const { OpenAIClient } = require('@azure/openai');
    const mockAzureClient = new OpenAIClient();
    mockAzureClient.getChatCompletions.mockRejectedValue(new Error('API Error'));

    azureOpenai.init(mockConfig);
    await expect(azureOpenai.getDescription(mockImageUrl)).rejects.toThrow('Azure OpenAI API request failed');
  });
});
