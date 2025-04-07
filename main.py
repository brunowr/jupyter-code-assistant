import os
from flask import Flask, request, jsonify
import json
import logging

# Setup logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "jupyterlab_ai_assistant_secret")

# LLM handlers
from src.jupyterlab_ai_assistant.llm import get_llm_instance

@app.route('/')
def index():
    return jsonify({"status": "JupyterLab AI Assistant API is running"})

@app.route('/ai-assistant/config', methods=['GET'])
def get_llm_config():
    """Return LLM configuration"""
    try:
        # Get available LLM configurations
        available_models = [
            {
                "id": "openai",
                "name": "OpenAI",
                "models": [
                    {"id": "gpt-4o", "name": "GPT-4o"},
                    {"id": "gpt-4-turbo", "name": "GPT-4 Turbo"},
                    {"id": "gpt-3.5-turbo", "name": "GPT-3.5 Turbo"}
                ],
                "defaultModel": "gpt-4o",
                "local": False
            },
            {
                "id": "anthropic",
                "name": "Anthropic",
                "models": [
                    {"id": "claude-3-5-sonnet-20241022", "name": "Claude 3.5 Sonnet"},
                    {"id": "claude-3-opus-20240229", "name": "Claude 3 Opus"},
                    {"id": "claude-3-sonnet-20240229", "name": "Claude 3 Sonnet"},
                    {"id": "claude-3-haiku-20240307", "name": "Claude 3 Haiku"}
                ],
                "defaultModel": "claude-3-5-sonnet-20241022",
                "local": False
            },
            {
                "id": "gemini",
                "name": "Google Gemini",
                "models": [
                    {"id": "gemini-pro", "name": "Gemini Pro"},
                    {"id": "gemini-ultra", "name": "Gemini Ultra"}
                ],
                "defaultModel": "gemini-pro",
                "local": False
            },
            {
                "id": "ollama",
                "name": "Ollama (Local)",
                "models": [
                    {"id": "llama3", "name": "Llama 3"},
                    {"id": "mistral", "name": "Mistral"},
                    {"id": "codellama", "name": "Code Llama"}
                ],
                "defaultModel": "llama3",
                "local": True
            }
        ]
        
        return jsonify({"available_models": available_models})
    except Exception as e:
        logger.error(f"Error getting LLM config: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/ai-assistant/llm', methods=['POST'])
def llm_request():
    """Handle LLM request"""
    try:
        data = request.json
        
        llm_type = data.get("llm_type", "openai")
        prompt = data.get("prompt", "")
        messages = data.get("messages", [])
        notebook_content = data.get("notebook_content", {})
        
        logger.debug(f"LLM request: {llm_type}, prompt: {prompt[:50]}...")
        
        # Get LLM instance
        llm = get_llm_instance(llm_type)
        
        # Generate response
        result = llm.generate_response(prompt, messages, notebook_content)
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error handling LLM request: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/ai-assistant/fix-error', methods=['POST'])
def fix_error():
    """Handle error fixing request"""
    try:
        data = request.json
        
        llm_type = data.get("llm_type", "openai")
        code = data.get("code", "")
        errors = data.get("errors", [])
        
        logger.debug(f"Error fix request: {llm_type}, code length: {len(code)}")
        
        # Get LLM instance
        llm = get_llm_instance(llm_type)
        
        # Fix errors
        fixed_code = llm.fix_errors(code, errors)
        
        return jsonify({"fixed_code": fixed_code})
    except Exception as e:
        logger.error(f"Error fixing code: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)