// src/claude.js
const { Anthropic } = require('@anthropic-ai/sdk');
const { getImageData } = require('./utils');
require('dotenv').config();

let client = null;

const init = (apiKey = process.env.ANTHROPIC_API_KEY) => {
  if (!apiKey) {
    throw new Error('Anthropic API key must be provided via apiKey parameter or ANTHROPIC_API_KEY environment variable.');
  }
  client = new Anthropic({ apiKey });
};

const getDescription = async (
  imageUrl,
  {
    prompt = "What's in this image?",
    maxTokens = 300,
    model = 'claude-3-sonnet-20240229'
  } = {}
) => {
  if (!client) {
    init();
  }

  const { encodedImage, contentType } = await getImageData(imageUrl);

  try {
    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: contentType,
                data: encodedImage
              }
            },
            {
              type: 'text',
              text: prompt
            }
          ]
        }
      ]
    });

    return response.content[0].text;
  } catch (error) {
    throw new Error(`Claude API request failed: ${error.message}`);
  }
};

module.exports = { init, getDescription };