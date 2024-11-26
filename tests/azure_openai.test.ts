// tests/azure_openai.test.ts
import { AzureOpenAI } from "openai";
import { azureOpenai } from '../src/azure_openai';
import { getImageData, processBatchImages } from '../src/utils';
import { AzureOpenAIOptions, BatchImageResult } from '../src/types';

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

jest.mock('../src/utils', () => ({
  getImageData: jest.fn(),
  processBatchImages: jest.fn()
}));

describe('Azure OpenAI Service', () => {
  const mockConfig = {
    apiKey: 'test-api-key',
    endpoint: 'https://test.openai.azure.com',
    deploymentName: 'test-deployment',
    apiVersion: '2024-07-01-preview'
  };
  const mockImageUrl = 'https://example.com/image.jpg';
  const mockEncodedImage = 'base64-encoded-image';
  const mockDescription = 'This is a test description';
  const mockBatchResults: BatchImageResult[] = [
    { success: true, description: mockDescription, imagePath: 'test1.jpg' },
    { success: true, description: mockDescription, imagePath: 'test2.jpg' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AZURE_OPENAI_API_KEY = mockConfig.apiKey;
    process.env.AZURE_OPENAI_ENDPOINT = mockConfig.endpoint;
    process.env.AZURE_OPENAI_DEPLOYMENT = mockConfig.deploymentName;
    (getImageData as jest.Mock).mockResolvedValue({
      encodedImage: mockEncodedImage,
      contentType: 'image/jpeg'
    });
    (processBatchImages as jest.Mock).mockResolvedValue(mockBatchResults);
  });

  describe('Initialization', () => {
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
  });

  describe('Single Image Processing', () => {
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
      expect(getImageData).toHaveBeenCalledWith(mockImageUrl);
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        model: mockConfig.deploymentName,
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

      const options: AzureOpenAIOptions = {
        prompt: 'Custom prompt',
        maxTokens: 500,
        systemPrompt: 'Custom system prompt'
      };

      azureOpenai.init(mockConfig);
      const result = await azureOpenai.getDescription(mockImageUrl, options);
      
      expect(result).toBe(mockDescription);
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        model: mockConfig.deploymentName,
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
      await expect(azureOpenai.getDescription(mockImageUrl))
        .rejects.toThrow('Azure OpenAI API request failed');
    });

    test('getDescription() should throw error if not initialized', async () => {
      jest.spyOn(azureOpenai as any, 'client', 'get').mockReturnValue(null);
      await expect(azureOpenai.getDescription(mockImageUrl))
        .rejects.toThrow('Client not initialized');
    });
  });

  describe('Batch Processing', () => {
    const mockImagePaths = [
      'https://example.com/image1.jpg',
      '/path/to/image2.jpg',
      'https://example.com/image3.jpg'
    ];

    beforeEach(() => {
      azureOpenai.init(mockConfig);
    });

    test('getDescriptionBatch should process multiple images', async () => {
      const results = await azureOpenai.getDescriptionBatch(mockImagePaths);
      expect(results).toEqual(mockBatchResults);
      expect(processBatchImages).toHaveBeenCalledWith(
        mockImagePaths,
        expect.any(Function),
        3
      );
    });

    test('getDescriptionBatch should handle custom options', async () => {
      const options = {
        prompt: 'Custom prompt',
        maxTokens: 500,
        systemPrompt: 'Custom system prompt',
        concurrentLimit: 2
      };

      await azureOpenai.getDescriptionBatch(mockImagePaths, options);
      expect(processBatchImages).toHaveBeenCalledWith(
        mockImagePaths,
        expect.any(Function),
        options.concurrentLimit
      );
    });

    test('getDescriptionBatch should enforce maximum image limit', async () => {
      const tooManyImages = Array(21).fill('image.jpg');
      await expect(azureOpenai.getDescriptionBatch(tooManyImages))
        .rejects.toThrow('Maximum of 20 images allowed');
    });

    test('getDescriptionBatch should handle mixed success/failure results', async () => {
      const mockMixedResults: BatchImageResult[] = [
        { success: true, description: mockDescription, imagePath: 'test1.jpg' },
        { success: false, error: 'Failed', imagePath: 'test2.jpg' },
        { success: true, description: mockDescription, imagePath: 'test3.jpg' }
      ];

      (processBatchImages as jest.Mock).mockResolvedValue(mockMixedResults);

      const results = await azureOpenai.getDescriptionBatch(mockImagePaths);
      expect(results).toEqual(mockMixedResults);
      expect(results.filter(r => r.success)).toHaveLength(2);
      expect(results.filter(r => !r.success)).toHaveLength(1);
    });

    test('getDescriptionBatch should handle initialization error', async () => {
      jest.spyOn(azureOpenai as any, 'client', 'get').mockReturnValue(null);
      await expect(azureOpenai.getDescriptionBatch(mockImagePaths))
        .rejects.toThrow('Client not initialized');
    });

    test('getDescriptionBatch should use default options when none provided', async () => {
      await azureOpenai.getDescriptionBatch(mockImagePaths);
      
      expect(processBatchImages).toHaveBeenCalledWith(
        mockImagePaths,
        expect.any(Function),
        3 // default concurrentLimit
      );
    });
  });
});