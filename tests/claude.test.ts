// tests/claude.test.ts
import { Anthropic } from '@anthropic-ai/sdk';
import { claude } from '../src/claude';
import { getImageData, processBatchImages } from '../src/utils';
import { ClaudeOptions, BatchImageResult } from '../src/types';

jest.mock('@anthropic-ai/sdk', () => ({
  Anthropic: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn()
    }
  }))
}));

jest.mock('../src/utils', () => ({
  getImageData: jest.fn(),
  processBatchImages: jest.fn()
}));

describe('Claude Service', () => {
  const mockApiKey = 'test-api-key';
  const mockImageUrl = 'https://example.com/image.jpg';
  const mockEncodedImage = 'base64-encoded-image';
  const mockDescription = 'This is a test description';
  const mockBatchResults: BatchImageResult[] = [
    { success: true, description: mockDescription, imagePath: 'test1.jpg' },
    { success: true, description: mockDescription, imagePath: 'test2.jpg' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = mockApiKey;
    (getImageData as jest.Mock).mockResolvedValue({
      encodedImage: mockEncodedImage,
      contentType: 'image/jpeg'
    });
    (processBatchImages as jest.Mock).mockResolvedValue(mockBatchResults);
  });

  describe('Initialization', () => {
    test('init() should initialize client with API key', () => {
      claude.init(mockApiKey);
      expect(Anthropic).toHaveBeenCalledWith({ apiKey: mockApiKey });
      expect(claude.getDescription).toBeDefined();
    });

    test('init() should use environment variable if no API key provided', () => {
      claude.init();
      expect(Anthropic).toHaveBeenCalledWith({ apiKey: process.env.ANTHROPIC_API_KEY });
      expect(claude.getDescription).toBeDefined();
    });

    test('init() should throw error if no API key available', () => {
      delete process.env.ANTHROPIC_API_KEY;
      expect(() => claude.init()).toThrow('Anthropic API key must be provided');
    });
  });

  describe('Single Image Processing', () => {
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
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            content: expect.arrayContaining([
              expect.objectContaining({ type: 'image' }),
              expect.objectContaining({ type: 'text' })
            ])
          })
        ])
      }));
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
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        max_tokens: options.maxTokens,
        model: options.model
      }));
    });

    test('getDescription() should handle different media types', async () => {
      const mockCreate = jest.fn().mockResolvedValue({
        content: [{ text: mockDescription }]
      });

      (Anthropic as jest.MockedClass<typeof Anthropic>).mockImplementation(() => ({
        messages: { create: mockCreate }
      } as any));

      const mediaTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
      ];

      for (const mediaType of mediaTypes) {
        (getImageData as jest.Mock).mockResolvedValueOnce({
          encodedImage: mockEncodedImage,
          contentType: mediaType
        });

        claude.init(mockApiKey);
        await claude.getDescription(mockImageUrl);

        expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: expect.arrayContaining([
                expect.objectContaining({
                  source: expect.objectContaining({
                    media_type: mediaType
                  })
                })
              ])
            })
          ])
        }));
      }
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

  describe('Batch Processing', () => {
    const mockImagePaths = [
      'https://example.com/image1.jpg',
      '/path/to/image2.jpg',
      'https://example.com/image3.jpg'
    ];

    beforeEach(() => {
      claude.init(mockApiKey);
    });

    test('getDescriptionBatch should process multiple images', async () => {
      const results = await claude.getDescriptionBatch(mockImagePaths);
      expect(results).toEqual(mockBatchResults);
      expect(processBatchImages).toHaveBeenCalledWith(
        mockImagePaths,
        expect.any(Function),
        3 // default concurrentLimit
      );
    });

    test('getDescriptionBatch should handle custom options', async () => {
      const options = {
        prompt: 'Custom prompt',
        maxTokens: 500,
        model: 'claude-3-opus-20240229',
        concurrentLimit: 2
      };

      await claude.getDescriptionBatch(mockImagePaths, options);

      expect(processBatchImages).toHaveBeenCalledWith(
        mockImagePaths,
        expect.any(Function),
        options.concurrentLimit
      );
    });

    test('getDescriptionBatch should throw error if not initialized', async () => {
      jest.spyOn(claude as any, 'client', 'get').mockReturnValue(null);
      await expect(claude.getDescriptionBatch(mockImagePaths))
        .rejects.toThrow('Client not initialized');
    });

    test('getDescriptionBatch should throw error on batch size exceed', async () => {
      const tooManyImages = Array(21).fill('https://example.com/image.jpg');
      await expect(claude.getDescriptionBatch(tooManyImages))
        .rejects.toThrow('Maximum of 20 images allowed');
    });

    test('getDescriptionBatch should handle mixed success/failure results', async () => {
      const mockMixedResults: BatchImageResult[] = [
        { success: true, description: mockDescription, imagePath: 'test1.jpg' },
        { success: false, error: 'Failed', imagePath: 'test2.jpg' },
        { success: true, description: mockDescription, imagePath: 'test3.jpg' }
      ];

      (processBatchImages as jest.Mock).mockResolvedValue(mockMixedResults);

      const results = await claude.getDescriptionBatch(mockImagePaths);
      expect(results).toEqual(mockMixedResults);
      expect(results.filter(r => r.success)).toHaveLength(2);
      expect(results.filter(r => !r.success)).toHaveLength(1);
    });
  });
});