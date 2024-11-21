// src/utils.ts
import axios from 'axios';
import mime from 'mime-types';
import { ImageData } from './types';

export const getImageData = async (imageUrl: string): Promise<ImageData> => {
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    
    if (response.status !== 200) {
      throw new Error(`Could not retrieve image from URL: ${imageUrl}`);
    }

    // Get content type
    let contentType = response.headers['content-type'];
    if (!contentType) {
      contentType = mime.lookup(imageUrl) || 'image/jpeg';
    }

    // Normalize content type
    contentType = contentType.toLowerCase();
    if (contentType === 'image/jpg') {
      contentType = 'image/jpeg';
    }

    // Encode image to base64
    const encodedImage = Buffer.from(response.data).toString('base64');

    return { encodedImage, contentType };
  } catch (error) {
    throw new Error(`Error fetching image data: ${(error as Error).message}`);
  }
};