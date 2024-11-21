# JSTextFromImage

Get descriptions of images using OpenAI's GPT-4o Vision models and Anthropic Claude in an easy way.

## Installation

You can install the jstextfromimage package via npm:

```bash
npm install jstextfromimage
```

## Usage

The jstextfromimage package provides easy-to-use methods to obtain image descriptions using OpenAI and Anthropic Claude. Below are examples of how to use each integration.

### Prerequisites

Ensure you have your API keys and necessary configurations set either by initializing the clients with parameters or by setting environment variables.

### Setting Environment Variables

Create a `.env` file in your project root and add the following:

```env
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
```

Note: Never commit your `.env` file or API keys to version control.

### Importing the Package

```javascript
// CommonJS
const { openai, claude } = require('jstextfromimage');

// ES Module
import { openai, claude } from 'jstextfromimage';
```

### Using OpenAI

```javascript
const { openai } = require('jstextfromimage');
require('dotenv').config(); // Ensure environment variables are loaded

// Option 1: Initialize OpenAI client with API key
openai.init('your-openai-api-key');

// Option 2: Use environment variables
// (Ensure you've set OPENAI_API_KEY in your .env file)
// openai.init();

const imageUrl = 'https://example.com/image.jpg';

// Basic usage
await openai.getDescription(imageUrl);

// Advanced usage with options
await openai.getDescription(imageUrl, {
  prompt: "Describe this image in detail",
  maxTokens: 500,
  model: 'gpt-4-vision-preview'
});
```

### Using Anthropic Claude

```javascript
const { claude } = require('jstextfromimage');
require('dotenv').config();

// Option 1: Initialize Claude client with API key
claude.init('your-anthropic-api-key');

// Option 2: Use environment variables
// (Ensure you've set ANTHROPIC_API_KEY in your .env file)
// claude.init();

const imageUrl = 'https://example.com/image.jpg';

// Basic usage
await claude.getDescription(imageUrl);

// Advanced usage with options
await claude.getDescription(imageUrl, {
  prompt: "Analyze this image in detail",
  maxTokens: 500,
  model: 'claude-3-sonnet-20240229'
});
```

## API Reference

### OpenAI Client

```typescript
interface OpenAIOptions {
  prompt?: string;         // Custom prompt for the model
  maxTokens?: number;      // Maximum length of the response
  model?: string;          // Model to use (default: 'gpt-4-vision-preview')
}

init(apiKey?: string): void
getDescription(imageUrl: string, options?: OpenAIOptions): Promise<string>
```

### Claude Client

```typescript
interface ClaudeOptions {
  prompt?: string;         // Custom prompt for the model
  maxTokens?: number;      // Maximum length of the response
  model?: string;          // Model to use (default: 'claude-3-sonnet-20240229')
}

init(apiKey?: string): void
getDescription(imageUrl: string, options?: ClaudeOptions): Promise<string>
```

## Error Handling

All methods throw errors with descriptive messages when something goes wrong. It's recommended to wrap calls in try-catch blocks:

```javascript
try {
  const description = await openai.getDescription(imageUrl);
  console.log(description);
} catch (error) {
  console.error('Error getting image description:', error.message);
}
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.