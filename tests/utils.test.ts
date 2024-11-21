// tests/utils.test.ts
import axios from 'axios';
import { getImageData } from '../src/utils';

// Mock axios
jest.mock('axios');

describe('Utils Module', () => {
  const mockImageUrl = 'https://example.com/image.jpg';
  const mockImageBuffer = Buffer.from('test-image-data');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getImageData should return encoded image and content type', async () => {
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

  test('getImageData should handle missing content type', async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      status: 200,
      data: mockImageBuffer,
      headers: {}
    });

    const result = await getImageData(mockImageUrl);
    expect(result).toHaveProperty('encodedImage');
    expect(result).toHaveProperty('contentType', 'image/jpeg'); // Default content type
  });

  test('getImageData should throw error on failed request', async () => {
    (axios.get as jest.Mock).mockRejectedValue(new Error('Network Error'));
    await expect(getImageData(mockImageUrl)).rejects.toThrow('Error fetching image data');
  });

  test('getImageData should throw error on non-200 status', async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      status: 404,
      data: 'Not Found'
    });

    await expect(getImageData(mockImageUrl)).rejects.toThrow('Could not retrieve image from URL');
  });
});