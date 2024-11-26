# JSTextFromImage

![npm Version](https://img.shields.io/npm/v/jstextfromimage)
![TypeScript](https://img.shields.io/npm/types/jstextfromimage)
![License](https://img.shields.io/npm/l/jstextfromimage)
![Downloads](https://img.shields.io/npm/dm/jstextfromimage)
![Node Version](https://img.shields.io/node/v/jstextfromimage)

A powerful TypeScript/JavaScript library for obtaining detailed descriptions of images using various AI models including OpenAI's GPT-4 Vision, Azure OpenAI, and Anthropic Claude. Supports both local files and URLs, with batch processing capabilities.

## 🌟 Key Features

- 🤖 **Multiple AI Providers**: Support for OpenAI, Azure OpenAI, and Anthropic Claude
- 🌐 **Flexible Input**: Support for both URLs and local file paths
- 📦 **Batch Processing**: Process multiple images (up to 20) concurrently
- 📝 **TypeScript First**: Built with TypeScript for excellent type safety
- 🔄 **Async/Await**: Modern Promise-based API
- 🔑 **Flexible Auth**: Multiple authentication methods including environment variables
- 🛡️ **Error Handling**: Comprehensive error types and handling
- 🎯 **Customizable**: Configurable options for each model

## 📦 Installation

```bash
npm install jstextfromimage
```

## 🚀 Quick Start

### TypeScript Usage

```typescript
import { openai, claude, azureOpenai } from 'jstextfromimage';
import { 
  OpenAIOptions, 
  ClaudeOptions, 
  AzureOpenAIOptions 
} from 'jstextfromimage/types';

// Initialize clients
openai.init('your-openai-api-key');
claude.init('your-claude-api-key');
azureOpenai.init({
  apiKey: 'your-azure-api-key',
  endpoint: 'your-azure-endpoint',
  deploymentName: 'your-deployment-name'
});

async function analyzeImage() {
  // Single image analysis (supports both URLs and local files)
  const imageUrl = 'https://example.com/image.jpg';
  const localImage = '/path/to/local/image.jpg';
  
  // OpenAI Analysis
  const openAIResult = await openai.getDescription(imageUrl, {
    model: 'gpt-4-vision-preview',
    maxTokens: 300
  });

  // Batch processing
  const imagePaths = [
    'https://example.com/image1.jpg',
    '/path/to/local/image2.jpg',
    'https://example.com/image3.jpg'
  ];

  const batchResults = await openai.getDescriptionBatch(imagePaths, {
    model: 'gpt-4-vision-preview',
    maxTokens: 300,
    concurrentLimit: 3 // Process 3 images at a time
  });

  console.log('Single Image:', openAIResult);
  console.log('Batch Results:', batchResults);
}
```

## 💡 Advanced Usage

### 🔧 Custom Configuration

```typescript
// Single image options
interface OpenAIOptions {
  model?: string;
  maxTokens?: number;
  prompt?: string;
}

interface ClaudeOptions {
  model?: string;
  maxTokens?: number;
  prompt?: string;
}

interface AzureOpenAIOptions {
  maxTokens?: number;
  prompt?: string;
  systemPrompt?: string;
}

// Batch processing options
interface BatchProcessOptions {
  concurrentLimit?: number; // Default: 3
}

// Example usage
const batchResults = await openai.getDescriptionBatch(imagePaths, {
  model: 'gpt-4-vision-preview',
  maxTokens: 500,
  prompt: 'Describe this image in detail',
  concurrentLimit: 5
});
```

### 🔐 Environment Variables

```env
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-claude-api-key
AZURE_OPENAI_API_KEY=your-azure-api-key
AZURE_OPENAI_ENDPOINT=your-azure-endpoint
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
```

### 🔍 Error Handling

```typescript
try {
  const description = await openai.getDescription(imagePath);
  console.log(description);
} catch (error) {
  if (error instanceof Error) {
    console.error('Failed to process image:', error.message);
  }
}

// Batch processing results
interface BatchImageResult {
  success: boolean;
  description?: string;
  error?: string;
  imagePath: string;
}

const results = await openai.getDescriptionBatch(imagePaths);
results.forEach(result => {
  if (result.success) {
    console.log(`Success for ${result.imagePath}:`, result.description);
  } else {
    console.error(`Failed for ${result.imagePath}:`, result.error);
  }
});
```

## 📚 API Reference

### OpenAI Service

```typescript
openai.init(apiKey?: string): void
openai.getDescription(imagePath: string, options?: OpenAIOptions): Promise<string>
openai.getDescriptionBatch(imagePaths: string[], options?: OpenAIOptions & BatchProcessOptions): Promise<BatchImageResult[]>
```

### Claude Service

```typescript
claude.init(apiKey?: string): void
claude.getDescription(imagePath: string, options?: ClaudeOptions): Promise<string>
claude.getDescriptionBatch(imagePaths: string[], options?: ClaudeOptions & BatchProcessOptions): Promise<BatchImageResult[]>
```

### Azure OpenAI Service

```typescript
interface AzureOpenAIConfig {
  apiKey: string;
  endpoint: string;
  deploymentName: string;
  apiVersion?: string;
}

azureOpenai.init(config: AzureOpenAIConfig): void
azureOpenai.getDescription(imagePath: string, options?: AzureOpenAIOptions): Promise<string>
azureOpenai.getDescriptionBatch(imagePaths: string[], options?: AzureOpenAIOptions & BatchProcessOptions): Promise<BatchImageResult[]>
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