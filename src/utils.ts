import fs from 'fs/promises';
import axios from 'axios';
import pLimit from 'p-limit';
import { ImageData, BatchImageResult } from './types';

const VALID_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;
type ValidMediaType = (typeof VALID_MEDIA_TYPES)[number];

function getValidMediaType(contentType: string): ValidMediaType {
  const normalizedType = contentType.toLowerCase();
  if (VALID_MEDIA_TYPES.includes(normalizedType as ValidMediaType)) {
    return normalizedType as ValidMediaType;
  }
  if (normalizedType === 'image/jpg') {
    return 'image/jpeg';
  }
  return 'image/jpeg';
}

export const getImageData = async (imagePath: string): Promise<ImageData> => {
  const isUrl = (path: string): boolean => {
    try {
      new URL(path);
      return true;
    } catch {
      return false;
    }
  };

  try {
    if (isUrl(imagePath)) {
      const response = await axios.get(imagePath, {
        responseType: 'arraybuffer'
      });
      
      if (response.status !== 200) {
        throw new Error('Could not retrieve image from URL');
      }

      return {
        encodedImage: Buffer.from(response.data).toString('base64'),
        contentType: getValidMediaType(response.headers['content-type'] || 'image/jpeg')
      };
    } else {
      const buffer = await fs.readFile(imagePath);
      const ext = imagePath.split('.').pop()?.toLowerCase() || 'jpg';
      const contentType = getValidMediaType({
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp'
      }[ext] || 'image/jpeg');

      return {
        encodedImage: buffer.toString('base64'),
        contentType
      };
    }
  } catch (error) {
    if (isUrl(imagePath)) {
      throw new Error(`Failed to fetch image from URL: ${(error as Error).message}`);
    } else {
      throw new Error(`Failed to read local image: ${(error as Error).message}`);
    }
  }
};

export const processBatchImages = async (
  imagePaths: string[],
  processor: (imagePath: string) => Promise<string>,
  concurrentLimit: number = 3
): Promise<BatchImageResult[]> => {
  if (imagePaths.length > 20) {
    throw new Error('Maximum of 20 images allowed per batch request');
  }

  const limit = pLimit(concurrentLimit);
  
  const tasks = imagePaths.map(imagePath =>
    limit(async (): Promise<BatchImageResult> => {
      try {
        const description = await processor(imagePath);
        return {
          success: true,
          description,
          imagePath
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          imagePath
        };
      }
    })
  );

  return Promise.all(tasks);
};