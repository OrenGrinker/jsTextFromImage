// src/utils.js
const axios = require('axios');

const getImageData = async (imageUrl) => {
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    
    if (response.status !== 200) {
      throw new Error(`Could not retrieve image from URL: ${imageUrl}`);
    }

    // Get content type
    let contentType = response.headers['content-type'];
    if (!contentType) {
      const mime = require('mime-types');
      contentType = mime.lookup(imageUrl) || 'image/jpeg';
    }

    // Encode image to base64
    const encodedImage = Buffer.from(response.data).toString('base64');
    return { encodedImage, contentType };
  } catch (error) {
    throw new Error(`Error fetching image data: ${error.message}`);
  }
};

module.exports = { getImageData };