// src/openai.js
const OpenAI = require('openai');
const { getImageData } = require('./utils');
require('dotenv').config();

let client = null;

const init = (apiKey = process.env.OPENAI_API_KEY) => {
  if (!apiKey) {
    throw new Error('OpenAI API key must be provided via apiKey parameter or OPENAI_API_KEY environment variable.');
  }
  client = new OpenAI({ apiKey });
};

const getDescription = async (
  imageUrl,
  {
    prompt = "What's in this image?",
    maxTokens = 300,
    model = 'gpt-4o'
  } = {}
) => {
  if (!client) {
    init();
  }

  const { encodedImage } = await getImageData(imageUrl);

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: { url: `data:image/png;base64,${encodedImage}` }
            }
          ]
        }
      ],
      max_tokens: maxTokens
    });

    return response.choices[0].message.content;
  } catch (error) {
    throw new Error(`OpenAI API request failed: ${error.message}`);
  }
};

module.exports = { init, getDescription };