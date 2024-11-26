// tests/openai.test.ts
import OpenAI from 'openai';
import { openai } from '../src/openai';
import { getImageData, processBatchImages } from '../src/utils';
import { OpenAIOptions, BatchImageResult } from '../src/types';

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn()
      }
    }
  }));
});

jest.mock('../src/utils', () => ({
  getImageData: jest.fn(),
  processBatchImages: jest.fn()
}));

describe('OpenAI Service', () => {
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
    process.env.OPENAI_API_KEY = mockApiKey;
    (getImageData as jest.Mock).mockResolvedValue({
      encodedImage: mockEncodedImage,
      contentType: 'image/jpeg'
    });
    (processBatchImages as jest.Mock).mockResolvedValue(mockBatchResults);
  });

  describe('Single Image Processing', () => {
    // ... (keep existing single image tests)
  });

  describe('Batch Processing', () => {
    const mockImagePaths = [
      'https://example.com/image1.jpg',
      '/path/to/image2.jpg',
      'https://example.com/image3.jpg'
    ];

    beforeEach(() => {
      openai.init(mockApiKey);
    });

    test('getDescriptionBatch should process multiple images', async () => {
      const results = await openai.getDescriptionBatch(mockImagePaths);
      expect(results).toEqual(mockBatchResults);
    });

    test('getDescriptionBatch should handle custom options', async () => {
      const options = {
        prompt: 'Custom prompt',
        maxTokens: 500,
        model: 'custom-model',
        concurrentLimit: 2
      };

      await openai.getDescriptionBatch(mockImagePaths, options);

      expect(processBatchImages).toHaveBeenCalledWith(
        mockImagePaths,
        expect.any(Function),
        options.concurrentLimit
      );
    });

    test('getDescriptionBatch should throw error if not initialized', async () => {
      jest.spyOn(openai as any, 'client', 'get').mockReturnValue(null);
      await expect(openai.getDescriptionBatch(mockImagePaths))
        .rejects.toThrow('Client not initialized');
    });

    test('getDescriptionBatch should throw error on batch size exceed', async () => {
      const tooManyImages = Array(21).fill('https://example.com/image.jpg');
      await expect(openai.getDescriptionBatch(tooManyImages))
        .rejects.toThrow('Maximum of 20 images allowed');
    });

    test('getDescriptionBatch should handle processing failures', async () => {
      const mockMixedResults: BatchImageResult[] = [
        { success: true, description: mockDescription, imagePath: 'test1.jpg' },
        { success: false, error: 'Failed', imagePath: 'test2.jpg' }
      ];

      (processBatchImages as jest.Mock).mockResolvedValue(mockMixedResults);

      const results = await openai.getDescriptionBatch(mockImagePaths);
      expect(results).toEqual(mockMixedResults);
      expect(results.filter(r => r.success)).toHaveLength(1);
      expect(results.filter(r => !r.success)).toHaveLength(1);
    });
  });
});
