# JSTextFromImage

![npm Version](https://img.shields.io/npm/v/jstextfromimage)
![TypeScript](https://img.shields.io/npm/types/jstextfromimage)
![License](https://img.shields.io/npm/l/jstextfromimage)
![Downloads](https://img.shields.io/npm/dm/jstextfromimage)
![Node Version](https://img.shields.io/node/v/jstextfromimage)

A powerful TypeScript/JavaScript library for obtaining detailed descriptions of images using various AI models including OpenAI's GPT-4 Vision, Azure OpenAI, and Anthropic Claude. Supports image URLs with batch processing capabilities.

## 🌟 Key Features

- 🤖 **Multiple AI Providers**: Support for OpenAI, Azure OpenAI, and Anthropic Claude
- 🌐 **URL Support**: Process images from URLs
- 📦 **Batch Processing**: Process multiple images concurrently
- 📝 **TypeScript First**: Built with TypeScript for excellent type safety
- 🔄 **Async/Await**: Modern Promise-based API
- 🔑 **Flexible Auth**: Multiple authentication methods including environment variables
- 🛡️ **Error Handling**: Comprehensive error handling

## 📦 Installation

```bash
npm install jstextfromimage
```

## 🚀 Quick Start

You can use the services either with environment variables or direct initialization.

### Using Environment Variables

```typescript
import { openai, claude, azureOpenai } from 'jstextfromimage';

// Services will automatically use environment variables
const description = await openai.getDescription('https://example.com/image.jpg');
```

### Direct Initialization

```typescript
import { OpenAIService, ClaudeService, AzureOpenAIService } from 'jstextfromimage';

// OpenAI custom instance
const customOpenAI = new OpenAIService('your-openai-api-key');

// Claude custom instance
const customClaude = new ClaudeService('your-claude-api-key');

// Azure OpenAI custom instance
const customAzure = new AzureOpenAIService({
  apiKey: 'your-azure-api-key',
  endpoint: 'your-azure-endpoint',
  deploymentName: 'your-deployment-name'
});
```

### OpenAI Service

```typescript
import { openai } from 'jstextfromimage';

// Single image analysis
const description = await openai.getDescription('https://example.com/image.jpg', {
  prompt: "Describe the main elements of this image",
  maxTokens: 500,
  model: 'gpt-4o'
});

// Batch processing
const imageUrls = [
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg',
  'https://example.com/image3.jpg'
];

const results = await openai.getDescriptionBatch(imageUrls, {
  prompt: "Analyze this image in detail",
  maxTokens: 300,
  concurrency: 2,
  model: 'gpt-4o'
});

// Process results
results.forEach(result => {
  if (result.error) {
    console.error(`Error processing ${result.imageUrl}: ${result.error}`);
  } else {
    console.log(`Description for ${result.imageUrl}: ${result.description}`);
  }
});
```

### Claude Service

```typescript
import { claude } from 'jstextfromimage';

// Single image analysis
const description = await claude.getDescription('https://example.com/artwork.jpg', {
  prompt: "Analyze this artwork, including style and composition",
  maxTokens: 1000,
  model: 'claude-3-sonnet-20240229'
});

// Batch processing
const artworkUrls = [
  'https://example.com/artwork1.jpg',
  'https://example.com/artwork2.jpg'
];

const analyses = await claude.getDescriptionBatch(artworkUrls, {
  prompt: "Provide a detailed art analysis",
  maxTokens: 800,
  concurrency: 2,
  model: 'claude-3-sonnet-20240229'
});
```

### Azure OpenAI Service

```typescript
import { azureOpenai } from 'jstextfromimage';

// Single image analysis
const description = await azureOpenai.getDescription('https://example.com/scene.jpg', {
  prompt: "Describe this scene in detail",
  maxTokens: 400,
  systemPrompt: "You are an expert in visual analysis."
});

// Batch processing
const sceneUrls = [
  'https://example.com/scene1.jpg',
  'https://example.com/scene2.jpg'
];

const analyses = await azureOpenai.getDescriptionBatch(sceneUrls, {
  prompt: "Analyze the composition and mood",
  maxTokens: 500,
  concurrency: 3,
  systemPrompt: "You are an expert cinematographer."
});
```

## 💡 Configuration

### Default Values

```typescript
// OpenAI defaults
{
  model: 'gpt-4o',
  maxTokens: 300,
  prompt: "What's in this image?",
  concurrency: 3  // for batch processing
}

// Claude defaults
{
  model: 'claude-3-sonnet-20240229',
  maxTokens: 300,
  prompt: "What's in this image?",
  concurrency: 3
}

// Azure OpenAI defaults
{
  maxTokens: 300,
  prompt: "What's in this image?",
  systemPrompt: "You are a helpful assistant.",
  concurrency: 3
}
```

### Local File Support

```typescript
import { openai } from 'jstextfromimage';

// Single local file
const description = await openai.getDescription('/path/to/local/image.jpg', {
  prompt: "Describe this image",
  maxTokens: 300,
  model: 'gpt-4o'
});

// Mix of local files and URLs in batch processing
const images = [
  '/path/to/local/image1.jpg',
  'https://example.com/image2.jpg',
  '/path/to/local/image3.png'
];

const results = await openai.getDescriptionBatch(images, {
  prompt: "Analyze each image",
  maxTokens: 300,
  concurrency: 2
});
```

### Environment Variables

```env
# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Claude
ANTHROPIC_API_KEY=your-claude-api-key

# Azure OpenAI
AZURE_OPENAI_API_KEY=your-azure-api-key
AZURE_OPENAI_ENDPOINT=your-azure-endpoint
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
```

### Options Interfaces

```typescript
// Base options for all services
interface BaseOptions {
  prompt?: string;
  maxTokens?: number;
  concurrency?: number; // For batch processing
}

// OpenAI specific options
interface OpenAIOptions extends BaseOptions {
  model?: string;
}

// Claude specific options
interface ClaudeOptions extends BaseOptions {
  model?: string;
}

// Azure OpenAI specific options
interface AzureOpenAIOptions extends BaseOptions {
  systemPrompt?: string;
}

// Azure OpenAI configuration
interface AzureOpenAIConfig {
  apiKey?: string;
  endpoint?: string;
  deploymentName?: string;
  apiVersion?: string;
}

// Batch processing results
interface BatchResult {
  imageUrl: string;
  description: string;
  error?: string;
}
```

## 🔍 Error Handling Examples

```typescript
// Single image with error handling
try {
  const description = await openai.getDescription(imageUrl, {
    maxTokens: 300
  });
  console.log(description);
} catch (error) {
  console.error('Failed to process image:', error);
}

// Batch processing with retry
async function processWithRetry(imageUrls: string[], maxRetries = 3) {
  const results = await openai.getDescriptionBatch(imageUrls, {
    maxTokens: 300,
    concurrency: 2
  });
  
  // Handle failed items with retry
  const failedItems = results.filter(r => r.error);
  let retryCount = 0;
  
  while (failedItems.length > 0 && retryCount < maxRetries) {
    const retryUrls = failedItems.map(item => item.imageUrl);
    const retryResults = await openai.getDescriptionBatch(retryUrls, {
      maxTokens: 300,
      concurrency: 1 // Lower concurrency for retries
    });
    
    // Update results with successful retries
    retryResults.forEach(result => {
      if (!result.error) {
        const index = results.findIndex(r => r.imageUrl === result.imageUrl);
        if (index !== -1) {
          results[index] = result;
        }
      }
    });
    
    retryCount++;
  }
  
  return results;
}
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build

# Run linting
npm run lint
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -am 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

For support, please [open an issue](https://github.com/OrenGrinker/jstextfromimage/issues/new) on GitHub.