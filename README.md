# JupyterLab AI Assistant

A JupyterLab extension providing an AI code assistant with multiple LLM support, contextual awareness, and code manipulation capabilities.

## Features

- Multiple LLM Support: OpenAI, Anthropic Claude, Google Gemini, and local Ollama models
- Contextual Awareness: Analyzes your notebook content for relevant assistance
- Code Manipulation: Apply code to cells or create new cells
- Error Fixing: Detect and fix errors in your code
- Shortcut Commands: Quick access to common actions

## Installation

### Prerequisites

- Python 3.9 or higher
- JupyterLab 4.0.0 or higher
- Node.js (for development)

### Getting Started

#### Installation from PyPI (Recommended)

```bash
pip install jupyterlab-ai-assistant
```

Then restart JupyterLab to enable the extension.

#### Manual Installation

1. Clone this repository
   ```bash
   git clone https://github.com/yourusername/jupyterlab-ai-assistant.git
   cd jupyterlab-ai-assistant
   ```

2. Install the package
   ```bash
   pip install -e .
   ```

3. Enable the server extension
   ```bash
   jupyter server extension enable jupyterlab_ai_assistant
   ```

4. Launch JupyterLab
   ```bash
   jupyter lab
   ```

## Configuration

### API Keys

Set these environment variables before starting JupyterLab:

- OPENAI_API_KEY - For OpenAI models
- ANTHROPIC_API_KEY - For Claude models
- GOOGLE_API_KEY - For Gemini models
- Ollama requires a local server running on the default port

You can also configure API keys in the extension settings panel.

## Usage

1. Launch JupyterLab
2. Open the AI Assistant panel
3. Ask questions or request code
4. Apply suggested code to your notebook

### Commands

- AI Assistant: Open chat panel
- Fix Last Error: Fix most recent error
- Fix All Errors: Fix all notebook errors

## Local Development Setup

For developers who want to contribute or customize the extension:

1. Make sure you have Git and Python 3.9+ installed
2. Before starting your local setup, ensure you have JupyterLab 4.0.0 or higher
3. For a development environment, Node.js is required
4. After setup, configure your API keys in environment variables or through the settings panel
5. Review our contribution guidelines before submitting pull requests

The extension supports hot reloading during development to make the development process more efficient.

## Commands Reference

Here are the key commands for reference:

For cloning the repository:
```
git clone https://github.com/yourusername/jupyterlab-ai-assistant.git
cd jupyterlab-ai-assistant
```

For setting up environment variables:
```
# Linux/macOS
export OPENAI_API_KEY="your-key-here"
export ANTHROPIC_API_KEY="your-key-here"
export GOOGLE_API_KEY="your-key-here"

# Windows (Command Prompt)
set OPENAI_API_KEY=your-key-here
set ANTHROPIC_API_KEY=your-key-here
set GOOGLE_API_KEY=your-key-here

# Windows (PowerShell)
$env:OPENAI_API_KEY="your-key-here"
$env:ANTHROPIC_API_KEY="your-key-here"
$env:GOOGLE_API_KEY="your-key-here"
```

For launching JupyterLab:
```
jupyter lab
```
