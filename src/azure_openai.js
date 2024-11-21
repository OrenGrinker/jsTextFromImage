// src/azure_openai.js
const { OpenAIClient, AzureKeyCredential } = require('@azure/openai');
const { getImageData } = require('./utils');
require('dotenv').config();

let client = null;
let deploymentName = null;

const init = ({
  apiKey = process.env.AZURE_OPENAI_API_KEY,
  apiBase = process.env.AZURE_OPENAI_ENDPOINT,
  deploymentNameParam = process.env.AZURE_OPENAI_DEPLOYMENT,
  apiVersion = '2024-02-15-preview'
} = {}) => {
  if (!apiKey || !apiBase || !deploymentNameParam) {
    throw new Error(
      'Azure OpenAI configuration must be provided via parameters or environment variables: AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_DEPLOYMENT'
    );
  }

  // Ensure apiBase has the correct format
  if (!apiBase.endsWith('/')) {
    apiBase += '/';
  }

  client = new OpenAIClient(
    `${apiBase}openai/deployments/${deploymentNameParam}`,
    new AzureKeyCredential(apiKey),
    { apiVersion }
  );
  deploymentName = deploymentNameParam;
};

const getDescription = async (
  imageUrl,
  {
    prompt = "What's in this image?",
    maxTokens = 300,
    systemPrompt = "You are a helpful assistant."
  } = {}
) => {
  if (!client) {
    init();
  }

  const { encodedImage } = await getImageData(imageUrl);

  try {
    const response = await client.getChatCompletions(deploymentName, {
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
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
    throw new Error(`Azure OpenAI API request failed: ${error.message}`);
  }
};

module.exports = { init, getDescription };