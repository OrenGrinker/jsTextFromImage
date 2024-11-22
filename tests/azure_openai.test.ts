// tests/azure_openai.test.ts
import { AzureOpenAI } from "openai";
import { azureOpenai } from '../src/azure_openai';

// Mock OpenAI client
jest.mock('openai', () => ({
  AzureOpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn()
      }
    }
  }))
}));

describe('Azure OpenAI Service', () => {
  const mockConfig = {
    apiKey: 'test-api-key',
    endpoint: 'https://test.openai.azure.com',
    deploymentName: 'test-deployment',
    apiVersion: '2024-07-01-preview'
  };
  const mockImageUrl = 'https://example.com/image.jpg';
  const mockDescription = 'This is a test description';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AZURE_OPENAI_API_KEY = mockConfig.apiKey;
    process.env.AZURE_OPENAI_ENDPOINT = mockConfig.endpoint;
    process.env.AZURE_OPENAI_DEPLOYMENT = mockConfig.deploymentName;
  });

  test('init() should initialize client with config', () => {
    azureOpenai.init(mockConfig);
    expect(AzureOpenAI).toHaveBeenCalledWith(expect.objectContaining({
      apiKey: mockConfig.apiKey,
      endpoint: mockConfig.endpoint,
      deployment: mockConfig.deploymentName
    }));
  });

  test('init() should use environment variables if no config provided', () => {
    azureOpenai.init();
    expect(AzureOpenAI).toHaveBeenCalledWith(expect.objectContaining({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT
    }));
  });

  test('init() should throw error if required config is missing', () => {
    delete process.env.AZURE_OPENAI_API_KEY;
    delete process.env.AZURE_OPENAI_ENDPOINT;
    delete process.env.AZURE_OPENAI_DEPLOYMENT;
    expect(() => azureOpenai.init()).toThrow();
  });

  test('getDescription() should return image description', async () => {
    const mockCreate = jest.fn().mockResolvedValue({
      choices: [{ message: { content: mockDescription } }]
    });

    (AzureOpenAI as jest.MockedClass<typeof AzureOpenAI>).mockImplementation(() => ({
      chat: { completions: { create: mockCreate } }
    } as any));

    azureOpenai.init(mockConfig);
    const result = await azureOpenai.getDescription(mockImageUrl);
    
    expect(result).toBe(mockDescription);
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      messages: expect.arrayContaining([
        expect.objectContaining({ role: 'system' }),
        expect.objectContaining({ role: 'user' })
      ])
    }));
  });

  test('getDescription() should handle custom options', async () => {
    const mockCreate = jest.fn().mockResolvedValue({
      choices: [{ message: { content: mockDescription } }]
    });

    (AzureOpenAI as jest.MockedClass<typeof AzureOpenAI>).mockImplementation(() => ({
      chat: { completions: { create: mockCreate } }
    } as any));

    const options = {
      prompt: 'Custom prompt',
      maxTokens: 500,
      systemPrompt: 'Custom system prompt'
    };

    azureOpenai.init(mockConfig);
    const result = await azureOpenai.getDescription(mockImageUrl, options);
    
    expect(result).toBe(mockDescription);
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      max_tokens: options.maxTokens,
      messages: expect.arrayContaining([
        expect.objectContaining({ 
          role: 'system',
          content: options.systemPrompt 
        })
      ])
    }));
  });

  test('getDescription() should throw error on API failure', async () => {
    const mockCreate = jest.fn().mockRejectedValue(new Error('API Error'));

    (AzureOpenAI as jest.MockedClass<typeof AzureOpenAI>).mockImplementation(() => ({
      chat: { completions: { create: mockCreate } }
    } as any));

    azureOpenai.init(mockConfig);
    await expect(azureOpenai.getDescription(mockImageUrl)).rejects.toThrow('Azure OpenAI API request failed');
  });
});