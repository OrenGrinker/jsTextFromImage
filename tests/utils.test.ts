// tests/utils.test.ts
import fs from 'fs/promises';
import axios from 'axios';
import { getImageData, processBatchImages } from '../src/utils';
import { BatchImageResult } from '../src/types';

jest.mock('axios');
jest.mock('fs/promises');

describe('Utils Module', () => {
  const mockImageUrl = 'https://example.com/image.jpg';
  const mockLocalPath = '/path/to/image.jpg';
  const mockImageBuffer = Buffer.from('test-image-data');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('URL Image Tests', () => {
    test('getImageData should return encoded image and content type for URLs', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        status: 200,
        data: mockImageBuffer,
        headers: {
          'content-type': 'image/jpeg'
        }
      });

      const result = await getImageData(mockImageUrl);
      expect(result).toHaveProperty('encodedImage');
      expect(result).toHaveProperty('contentType', 'image/jpeg');
      expect(axios.get).toHaveBeenCalledWith(mockImageUrl, { responseType: 'arraybuffer' });
    });

    test('getImageData should handle various content types for URLs', async () => {
      const testCases = [
        { contentType: 'image/png', expected: 'image/png' },
        { contentType: 'image/gif', expected: 'image/gif' },
        { contentType: 'image/webp', expected: 'image/webp' },
        { contentType: 'image/jpg', expected: 'image/jpeg' },
        { contentType: 'unknown/type', expected: 'image/jpeg' }
      ];

      for (const { contentType, expected } of testCases) {
        (axios.get as jest.Mock).mockResolvedValue({
          status: 200,
          data: mockImageBuffer,
          headers: { 'content-type': contentType }
        });

        const result = await getImageData(mockImageUrl);
        expect(result.contentType).toBe(expected);
      }
    });

    test('getImageData should handle missing content type for URLs', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        status: 200,
        data: mockImageBuffer,
        headers: {}
      });

      const result = await getImageData(mockImageUrl);
      expect(result.contentType).toBe('image/jpeg');
    });

    test('getImageData should throw error on failed URL request', async () => {
      (axios.get as jest.Mock).mockRejectedValue(new Error('Network Error'));
      await expect(getImageData(mockImageUrl)).rejects.toThrow('Failed to fetch image from URL');
    });
  });

  describe('Local File Tests', () => {
    test('getImageData should handle local files', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(mockImageBuffer);

      const result = await getImageData(mockLocalPath);
      expect(result).toHaveProperty('encodedImage');
      expect(result).toHaveProperty('contentType', 'image/jpeg');
      expect(fs.readFile).toHaveBeenCalledWith(mockLocalPath);
    });

    test('getImageData should determine correct content type from file extension', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(mockImageBuffer);

      const testCases = [
        { path: '/test/image.jpg', expected: 'image/jpeg' },
        { path: '/test/image.jpeg', expected: 'image/jpeg' },
        { path: '/test/image.png', expected: 'image/png' },
        { path: '/test/image.gif', expected: 'image/gif' },
        { path: '/test/image.webp', expected: 'image/webp' },
        { path: '/test/image.unknown', expected: 'image/jpeg' }
      ];

      for (const { path, expected } of testCases) {
        const result = await getImageData(path);
        expect(result.contentType).toBe(expected);
      }
    });

    test('getImageData should throw error on failed local file read', async () => {
      (fs.readFile as jest.Mock).mockRejectedValue(new Error('File not found'));
      await expect(getImageData(mockLocalPath)).rejects.toThrow('Failed to read local image');
    });
  });

  describe('Batch Processing Tests', () => {
    test('processBatchImages should handle multiple images', async () => {
      const processor = jest.fn().mockResolvedValue('Success');
      const imagePaths = ['path1.jpg', 'path2.jpg', 'path3.jpg'];
      
      const results = await processBatchImages(imagePaths, processor);
      
      expect(results).toHaveLength(3);
      expect(results.every(r => r.success)).toBe(true);
      expect(processor).toHaveBeenCalledTimes(3);
    });

    test('processBatchImages should enforce maximum image limit', async () => {
      const processor = jest.fn();
      const imagePaths = Array(21).fill('image.jpg');
      
      await expect(processBatchImages(imagePaths, processor))
        .rejects.toThrow('Maximum of 20 images allowed per batch request');
    });

    test('processBatchImages should handle processor failures', async () => {
      const processor = jest.fn()
        .mockResolvedValueOnce('Success 1')
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce('Success 2');
      
      const imagePaths = ['path1.jpg', 'path2.jpg', 'path3.jpg'];
      const results = await processBatchImages(imagePaths, processor);
      
      expect(results).toHaveLength(3);
      expect(results.filter(r => r.success)).toHaveLength(2);
      expect(results.filter(r => !r.success)).toHaveLength(1);
    });

    test('processBatchImages should respect concurrent limit', async () => {
      const processor = jest.fn().mockResolvedValue('Success');
      const imagePaths = Array(5).fill('image.jpg');
      const concurrentLimit = 2;
      
      await processBatchImages(imagePaths, processor, concurrentLimit);
      
      expect(processor).toHaveBeenCalledTimes(5);
    });

    test('processBatchImages should format results correctly', async () => {
      const processor = jest.fn().mockResolvedValue('Test description');
      const imagePaths = ['test1.jpg', 'test2.jpg'];
      
      const results = await processBatchImages(imagePaths, processor);
      
      expect(results).toEqual([
        {
          success: true,
          description: 'Test description',
          imagePath: 'test1.jpg'
        },
        {
          success: true,
          description: 'Test description',
          imagePath: 'test2.jpg'
        }
      ]);
    });
  });
});