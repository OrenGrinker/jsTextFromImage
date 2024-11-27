// src/utils.ts
import axios from 'axios';
import mime from 'mime-types';
import fs from 'fs/promises';
import path from 'path';
import { ImageData } from './types';

export const getImageData = async (imagePath: string): Promise<ImageData> => {
  try {
    // Check if the path is a URL or local file
    const isUrl = imagePath.startsWith('http://') || imagePath.startsWith('https://');

    if (isUrl) {
      // Handle URL
      const response = await axios.get(imagePath, { responseType: 'arraybuffer' });
      
      if (response.status !== 200) {
        throw new Error(`Could not retrieve image from URL: ${imagePath}`);
      }

      let contentType = response.headers['content-type'];
      if (!contentType) {
        contentType = mime.lookup(imagePath) || 'image/jpeg';
      }

      const encodedImage = Buffer.from(response.data).toString('base64');
      return {
        encodedImage,
        contentType: normalizeContentType(contentType)
      };
    } else {
      // Handle local file
      try {
        const fileData = await fs.readFile(imagePath);
        const contentType = mime.lookup(imagePath) || 'image/jpeg';
        const encodedImage = fileData.toString('base64');
        
        return {
          encodedImage,
          contentType: normalizeContentType(contentType)
        };
      } catch (error) {
        throw new Error(`Could not read local file: ${imagePath}. Error: ${(error as Error).message}`);
      }
    }
  } catch (error) {
    throw new Error(`Error processing image: ${(error as Error).message}`);
  }
};

const normalizeContentType = (contentType: string): string => {
  const type = contentType.toLowerCase();
  if (type === 'image/jpg') {
    return 'image/jpeg';
  }
  return type;
};

// Add type for input path
export type ImageInput = string; // Can be URL or local file path