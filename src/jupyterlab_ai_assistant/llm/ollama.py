import os
import json
import requests
from typing import Dict, List, Any, Optional
from .base import BaseLLM


class OllamaLLM(BaseLLM):
    """
    Ollama LLM implementation for local models
    """
    
    def __init__(self):
        """Initialize the Ollama client"""
        self.model = "llama3"
        self.base_url = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
        self.api_url = f"{self.base_url}/api"
    
    def generate_response(self, prompt: str, messages: List[Dict[str, Any]], 
                         notebook_content: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a response from Ollama
        
        Args:
            prompt: Current prompt/question from the user
            messages: Chat history
            notebook_content: Content of the notebook including code cells and outputs
            
        Returns:
            Dict with LLM response
        """
        # Format notebook content
        notebook_context = self.format_notebook_context(notebook_content)
        
        # Prepare the messages for Ollama
        ollama_messages = [
            {
                "role": "system",
                "content": (
                    "You are an expert coding assistant in JupyterLab. You have access to the current notebook "
                    "content and chat history. Provide helpful, concise responses to code-related questions. "
                    "When providing code suggestions, ensure they are correct, well-documented, and follow best practices. "
                    "You can reference specific cells from the notebook in your responses. "
                    "For code suggestions, wrap the code in ```python and ``` tags."
                )
            }
        ]
        
        # Add previous messages
        for msg in messages:
            role = msg.get("role", "user")
            if role not in ["system", "user", "assistant"]:
                role = "user"
            
            ollama_messages.append({
                "role": role,
                "content": msg.get("content", "")
            })
        
        # Add current message with notebook context
        ollama_messages.append({
            "role": "user",
            "content": f"Current notebook:\n{notebook_context}\n\nUser request: {prompt}"
        })
        
        # Prepare the request to Ollama
        data = {
            "model": self.model,
            "messages": ollama_messages,
            "stream": False
        }
        
        # Generate response from Ollama
        try:
            response = requests.post(f"{self.api_url}/chat", json=data, timeout=60)
            response.raise_for_status()
            
            response_data = response.json()
            content = response_data.get("message", {}).get("content", "")
            
            return {
                "content": content,
                "has_code": "```" in content,
                "model": self.model,
                "provider": "Ollama"
            }
        except Exception as e:
            return {
                "content": f"Error generating response: {str(e)}",
                "has_code": False,
                "model": self.model,
                "provider": "Ollama",
                "error": True
            }
    
    def fix_errors(self, code: str, errors: List[Dict[str, Any]]) -> str:
        """
        Fix errors in the code using Ollama
        
        Args:
            code: The code with errors
            errors: List of error messages and details
            
        Returns:
            Fixed code as a string
        """
        error_text = "\n".join([f"Error {i+1}: {error.get('message', '')}" 
                               for i, error in enumerate(errors)])
        
        data = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": "You are an expert Python code debugger. When provided code with errors, fix the errors and return only the corrected code without explanations or markdown formatting."
                },
                {
                    "role": "user",
                    "content": f"""
                    Fix the following Python code that has errors:
                    
                    ```python
                    {code}
                    ```
                    
                    Errors:
                    {error_text}
                    
                    Provide only the fixed code without explanations.
                    """
                }
            ],
            "stream": False
        }
        
        try:
            response = requests.post(f"{self.api_url}/chat", json=data, timeout=60)
            response.raise_for_status()
            
            response_data = response.json()
            fixed_code = response_data.get("message", {}).get("content", "")
            
            # Clean up any markdown code blocks
            if fixed_code.startswith("```python"):
                fixed_code = fixed_code.replace("```python", "", 1)
                if fixed_code.endswith("```"):
                    fixed_code = fixed_code[:-3]
            elif fixed_code.startswith("```"):
                fixed_code = fixed_code.replace("```", "", 1)
                if fixed_code.endswith("```"):
                    fixed_code = fixed_code[:-3]
                    
            return fixed_code.strip()
        except Exception as e:
            return f"# Error fixing code: {str(e)}\n{code}"
    
    def get_config(self) -> Dict[str, Any]:
        """
        Get configuration for this LLM
        
        Returns:
            Dictionary with configuration details
        """
        # Try to get available models from Ollama
        models = [
            {"id": "llama3", "name": "Llama 3"},
            {"id": "mistral", "name": "Mistral"},
            {"id": "codellama", "name": "Code Llama"},
            {"id": "llama2", "name": "Llama 2"}
        ]
        
        try:
            response = requests.get(f"{self.api_url}/tags", timeout=5)
            if response.status_code == 200:
                data = response.json()
                models = [{"id": model["name"], "name": model["name"]} for model in data.get("models", [])]
        except:
            # Use default models if Ollama isn't available
            pass
        
        return {
            "name": "Ollama",
            "id": "ollama",
            "default_model": self.model,
            "models": models,
            "local": True
        }
