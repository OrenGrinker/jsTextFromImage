# JSTextFromImage

Get descriptions of images from OpenAI, Azure OpenAI and Anthropic Claude models in an easy way.

## Installation

```bash
npm install jstextfromimage
```

## Features

- Image analysis using OpenAI's GPT-4 Vision from OpenAI or Azure OpenAI
- Image analysis using Anthropic's Claude 3
- TypeScript support
- Easy to use API
- Configurable options for each model
- Built-in error handling
- Environment variables support

## Usage

### TypeScript/ES Modules

```typescript
import { openai, claude } from 'jstextfromimage';
import { OpenAIOptions, ClaudeOptions } from 'jstextfromimage/types';

// Initialize with API keys
openai.init('your-openai-api-key');
claude.init('your-claude-api-key');

// Example usage with OpenAI
async function analyzeImageWithOpenAI() {
  try {
    const options: OpenAIOptions = {
      prompt: "What's in this image? Please describe in detail.",
      maxTokens: 300,
      model: 'gpt-4-vision-preview'  // Optional, defaults to gpt-4-vision-preview
    };

    const description = await openai.getDescription(
      'https://example.com/image.jpg',
      options
    );
    console.log('OpenAI Description:', description);
  } catch (error) {
    console.error('OpenAI Error:', error);
  }
}

// Example usage with Claude
async function analyzeImageWithClaude() {
  try {
    const options: ClaudeOptions = {
      prompt: "What's in this image? Please describe in detail.",
      maxTokens: 300,
      model: 'claude-3-sonnet-20240229'  // Optional, defaults to claude-3-sonnet-20240229
    };

    const description = await claude.getDescription(
      'https://example.com/image.jpg',
      options
    );
    console.log('Claude Description:', description);
  } catch (error) {
    console.error('Claude Error:', error);
  }
}
```

### JavaScript/CommonJS

```javascript
const { openai, claude } = require('jstextfromimage');

// Initialize with API keys
openai.init('your-openai-api-key');
claude.init('your-claude-api-key');

async function analyzeImage() {
  try {
    // Using OpenAI
    const openAiDescription = await openai.getDescription(
      'https://example.com/image.jpg',
      {
        prompt: "What's in this image?",
        maxTokens: 300
      }
    );
    console.log('OpenAI Description:', openAiDescription);

    // Using Claude
    const claudeDescription = await claude.getDescription(
      'https://example.com/image.jpg',
      {
        prompt: "What's in this image?",
        maxTokens: 300
      }
    );
    console.log('Claude Description:', claudeDescription);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Using Environment Variables

Create a `.env` file in your project root:

```env
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-claude-api-key
AZURE_OPENAI_API_KEY=your-azure-api-key
AZURE_OPENAI_ENDPOINT=your-azure-endpoint
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
```

Then you can initialize without passing API keys:

```typescript
import { openai, claude } from 'jstextfromimage';

// Will use environment variables
openai.init();
claude.init();
```

## API Reference

### OpenAI Service

#### `openai.init(apiKey?: string): void`
Initializes the OpenAI client. Uses `OPENAI_API_KEY` environment variable if no key is provided.

#### `openai.getDescription(imageUrl: string, options?: OpenAIOptions): Promise<string>`
Gets a description of the image using OpenAI's GPT-4 Vision.

```typescript
interface OpenAIOptions {
  prompt?: string;      // Custom prompt for the model
  maxTokens?: number;   // Maximum tokens in response
  model?: string;       // Model to use
}
```

### Claude Service

#### `claude.init(apiKey?: string): void`
Initializes the Claude client. Uses `ANTHROPIC_API_KEY` environment variable if no key is provided.

#### `claude.getDescription(imageUrl: string, options?: ClaudeOptions): Promise<string>`
Gets a description of the image using Claude 3.

```typescript
interface ClaudeOptions {
  prompt?: string;      // Custom prompt for the model
  maxTokens?: number;   // Maximum tokens in response
  model?: string;       // Model to use
}
```

### Azure OpenAI

```typescript
import { azureOpenai } from 'jstextfromimage';

// Initialize with configuration
azureOpenai.init({
  apiKey: 'your-azure-api-key',
  endpoint: 'your-azure-endpoint',
  deploymentName: 'your-deployment-name',
  apiVersion: '2024-07-01-preview'  // Optional
});

// Or use environment variables
azureOpenai.init();  // Will use AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_DEPLOYMENT

async function analyzeImageWithAzure() {
  try {
    const description = await azureOpenai.getDescription(
      'https://example.com/image.jpg',
      {
        prompt: "What's in this image?",
        maxTokens: 300,
        systemPrompt: "You are a helpful assistant."
      }
    );
    console.log('Azure OpenAI Description:', description);
  } catch (error) {
    console.error('Azure OpenAI Error:', error);
  }
}
```

## Error Handling

The library throws errors in these cases:
- Invalid API keys
- Failed image fetching
- API request failures
- Invalid responses

Example error handling:

```typescript
import { openai } from 'jstextfromimage';

try {
  const description = await openai.getDescription('https://example.com/image.jpg');
  console.log(description);
} catch (error) {
  if (error instanceof Error) {
    switch (error.message) {
      case 'OpenAI API request failed':
        console.error('API request failed:', error);
        break;
      case 'Error fetching image data':
        console.error('Image fetch failed:', error);
        break;
      default:
        console.error('Unexpected error:', error);
    }
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build the project
npm run build

# Lint the code
npm run lint
```

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -am 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For support, please [open an issue](https://github.com/OrenGrinker/jstextfromimage/issues/new) on GitHub.