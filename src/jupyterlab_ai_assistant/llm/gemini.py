import os
import json
from typing import Dict, List, Any, Optional
import google.generativeai as genai
from .base import BaseLLM


class GeminiLLM(BaseLLM):
    """
    Google Gemini LLM implementation
    """
    
    def __init__(self):
        """Initialize the Gemini client"""
        self.model = "gemini-pro"
        api_key = os.environ.get("GOOGLE_API_KEY")
        
        if not api_key:
            self.gemini = None
            self.models = []
        else:
            try:
                # Configure the Gemini API
                genai.configure(api_key=api_key)
                
                # Get available models
                self.models = [m for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
                
                # Set up the model
                self.gemini = genai.GenerativeModel(self.model)
            except Exception as e:
                self.gemini = None
                self.models = []
    
    def generate_response(self, prompt: str, messages: List[Dict[str, Any]], 
                         notebook_content: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a response from Google Gemini
        
        Args:
            prompt: Current prompt/question from the user
            messages: Chat history
            notebook_content: Content of the notebook including code cells and outputs
            
        Returns:
            Dict with LLM response
        """
        # Check if client is None (API key not set or invalid)
        if self.gemini is None:
            return {
                "content": "Error: Google API key is not set or is invalid. Please provide a valid API key in the settings.",
                "has_code": False,
                "model": self.model,
                "provider": "Google Gemini",
                "error": True
            }
            
        # Format notebook content
        notebook_context = self.format_notebook_context(notebook_content)
        
        try:
            # Prepare the chat session with history
            chat = self.gemini.start_chat(history=[])
            
            # Add system message
            chat.send_message(
                "You are an expert coding assistant in JupyterLab. You have access to the current notebook "
                "content and chat history. Provide helpful, concise responses to code-related questions. "
                "When providing code suggestions, ensure they are correct, well-documented, and follow best practices. "
                "You can reference specific cells from the notebook in your responses. "
                "For code suggestions, wrap the code in ```python and ``` tags."
            )
            
            # Add previous messages to chat
            for msg in messages:
                if msg.get("role") == "assistant":
                    chat.history.append({
                        "role": "model",
                        "parts": [msg.get("content", "")]
                    })
                else:
                    chat.history.append({
                        "role": "user",
                        "parts": [msg.get("content", "")]
                    })
            
            # Send the prompt with notebook context
            response = chat.send_message(
                f"Current notebook:\n{notebook_context}\n\nUser request: {prompt}"
            )
            
            content = response.text
            return {
                "content": content,
                "has_code": "```" in content,
                "model": self.model,
                "provider": "Google Gemini"
            }
        except Exception as e:
            return {
                "content": f"Error generating response: {str(e)}",
                "has_code": False,
                "model": self.model,
                "provider": "Google Gemini",
                "error": True
            }
    
    def fix_errors(self, code: str, errors: List[Dict[str, Any]]) -> str:
        """
        Fix errors in the code using Gemini
        
        Args:
            code: The code with errors
            errors: List of error messages and details
            
        Returns:
            Fixed code as a string
        """
        # Check if client is None (API key not set or invalid)
        if self.gemini is None:
            return f"# Error: Google API key is not set or is invalid. Please provide a valid API key in the settings.\n{code}"
            
        error_text = "\n".join([f"Error {i+1}: {error.get('message', '')}" 
                               for i, error in enumerate(errors)])
        
        prompt = f"""
        Fix the following Python code that has errors:
        
        ```python
        {code}
        ```
        
        Errors:
        {error_text}
        
        Provide only the fixed code without explanations.
        """
        
        try:
            # Initialize a new generative model for this request
            model = genai.GenerativeModel(self.model)
            
            # Add system prompt
            response = model.generate_content([
                "You are an expert Python code debugger. When provided code with errors, fix the errors and return only the corrected code without explanations or markdown formatting.",
                prompt
            ])
            
            fixed_code = response.text
            
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
        return {
            "name": "Google Gemini",
            "id": "gemini",
            "default_model": self.model,
            "models": [
                {"id": "gemini-pro", "name": "Gemini Pro"},
                {"id": "gemini-1.5-pro", "name": "Gemini 1.5 Pro"},
                {"id": "gemini-1.0-pro", "name": "Gemini 1.0 Pro"}
            ]
        }
