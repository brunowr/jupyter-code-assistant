# JupyterLab AI Assistant

A JupyterLab extension providing an AI code assistant with multiple LLM support, contextual awareness, and code manipulation capabilities.

## Features

- **Multiple LLM Support**: Integrates with OpenAI, Anthropic Claude, Google Gemini, and local Ollama models
- **Contextual Awareness**: Analyzes your notebook content to provide relevant assistance
- **Code Manipulation**: Apply suggested code directly to cells or create new cells
- **Error Fixing**: Automatically detect and fix errors in your code
- **Shortcut Commands**: Quick access to common actions like error fixing

## Installation

### Prerequisites

- Python 3.9 or higher
- JupyterLab 4.0.0 or higher
- [Node.js](https://nodejs.org/en/) (for development)

### Option 1: Install from PyPI (Coming Soon)

```bash
pip install jupyterlab-ai-assistant
```

### Option 2: Install from Source

1. Clone the repository:

```bash
git clone https://github.com/yourusername/jupyterlab-ai-assistant.git
cd jupyterlab-ai-assistant
```

2. Install the package in development mode:

```bash
pip install -e .
```

3. Install the server extension:

```bash
jupyter server extension enable jupyterlab_ai_assistant
```

4. Launch JupyterLab:

```bash
jupyter lab
```

## Configuration

### API Keys

To use the various LLM providers, you'll need to obtain API keys:

- **OpenAI**: Set the `OPENAI_API_KEY` environment variable ([Get API Key](https://platform.openai.com/api-keys))
- **Anthropic Claude**: Set the `ANTHROPIC_API_KEY` environment variable ([Get API Key](https://www.anthropic.com/api))
- **Google Gemini**: Set the `GOOGLE_API_KEY` environment variable ([Get API Key](https://ai.google.dev/))
- **Ollama**: For local models, ensure Ollama is running on the default port

You can set these environment variables before starting JupyterLab:

```bash
export OPENAI_API_KEY="your-api-key"
export ANTHROPIC_API_KEY="your-api-key"
export GOOGLE_API_KEY="your-api-key"
jupyter lab
```

Or you can configure the API keys through the extension's settings panel.

## Usage

1. Launch JupyterLab
2. Open the AI Assistant panel using the icon in the left sidebar
3. Ask questions or request code generation related to your notebook
4. Use the provided buttons to apply code snippets to your notebook

### Commands

- **AI Assistant**: Open the AI chat panel
- **Fix Last Error**: Automatically fix the most recent error
- **Fix All Errors**: Scan and fix all errors in the notebook

## Development

To build the extension for development:

1. Install development dependencies:

```bash
pip install -e ".[dev]"
```

2. Make your changes to the code

3. Restart the JupyterLab server to see your changes:

```bash
jupyter lab
```