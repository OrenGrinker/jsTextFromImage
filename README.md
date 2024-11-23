# JSTextFromImage

![npm Version](https://img.shields.io/npm/v/jstextfromimage)
![TypeScript](https://img.shields.io/npm/types/jstextfromimage)
![License](https://img.shields.io/npm/l/jstextfromimage)
![Downloads](https://img.shields.io/npm/dm/jstextfromimage)
![Node Version](https://img.shields.io/node/v/jstextfromimage)

A powerful TypeScript/JavaScript library for obtaining detailed descriptions of images using various AI models including OpenAI's GPT-4 Vision, Azure OpenAI, and Anthropic Claude 3.

## 🌟 Key Features

- 🤖 **Multiple AI Providers**: Support for OpenAI, Azure OpenAI, and Anthropic Claude
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
  const imageUrl = 'https://example.com/image.jpg';
  
  // OpenAI Analysis
  const openAIResult = await openai.getDescription(imageUrl, {
    model: 'gpt-4-vision-preview',
    maxTokens: 300,
    temperature: 0.7
  });

  // Claude Analysis
  const claudeResult = await claude.getDescription(imageUrl, {
    model: 'claude-3-sonnet-20240229',
    maxTokens: 300,
    temperature: 0.7
  });

  console.log('OpenAI:', openAIResult);
  console.log('Claude:', claudeResult);
}
```

## 💡 Advanced Usage

### 🔧 Custom Configuration

```typescript
interface AdvancedOptions {
  // OpenAI specific options
  openai: {
    model: string;
    maxTokens: number;
    temperature: number;
    systemPrompt?: string;
    responseFormat?: 'text' | 'json';
  };
  
  // Claude specific options
  claude: {
    model: string;
    maxTokens: number;
    temperature: number;
    topP?: number;
    topK?: number;
  };
  
  // Azure specific options
  azure: {
    deploymentName: string;
    apiVersion: string;
    temperature: number;
    responseFormat?: 'text' | 'json';
  };
}

const result = await openai.getDescription(imageUrl, {
  model: 'gpt-4-vision-preview',
  maxTokens: 500,
  temperature: 0.7,
  systemPrompt: 'You are a detail-oriented image analyst.',
  responseFormat: 'json'
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
import { 
  APIError, 
  ImageFetchError, 
  InvalidConfigError 
} from 'jstextfromimage/errors';

try {
  const description = await openai.getDescription(imageUrl, options);
  console.log(description);
} catch (error) {
  if (error instanceof APIError) {
    console.error('API request failed:', error.message);
  } else if (error instanceof ImageFetchError) {
    console.error('Failed to fetch image:', error.message);
  } else if (error instanceof InvalidConfigError) {
    console.error('Invalid configuration:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## 📚 API Reference

### OpenAI Service

```typescript
interface OpenAIOptions {
  model?: string;         // Default: 'gpt-4-vision-preview'
  maxTokens?: number;     // Default: 300
  temperature?: number;   // Default: 0.7
  systemPrompt?: string;
  responseFormat?: 'text' | 'json';
}

openai.init(apiKey?: string): void
openai.getDescription(imageUrl: string, options?: OpenAIOptions): Promise<string | object>
```

### Claude Service

```typescript
interface ClaudeOptions {
  model?: string;         // Default: 'claude-3-sonnet-20240229'
  maxTokens?: number;     // Default: 300
  temperature?: number;   // Default: 0.7
  topP?: number;
  topK?: number;
}

claude.init(apiKey?: string): void
claude.getDescription(imageUrl: string, options?: ClaudeOptions): Promise<string>
```

### Azure OpenAI Service

```typescript
interface AzureOpenAIConfig {
  apiKey: string;
  endpoint: string;
  deploymentName: string;
  apiVersion?: string;    // Default: '2024-02-01-preview'
}

azureOpenai.init(config: AzureOpenAIConfig): void
azureOpenai.getDescription(imageUrl: string, options?: OpenAIOptions): Promise<string>
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build

# Lint the code
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

For support, please [open an issue](https://github.com/yourusername/jstextfromimage/issues/new) on GitHub.