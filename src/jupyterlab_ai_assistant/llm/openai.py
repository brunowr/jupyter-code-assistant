import os
import json
from typing import Dict, List, Any, Optional
import openai
from openai import OpenAI
from .base import BaseLLM


class OpenAILLM(BaseLLM):
    """
    OpenAI LLM implementation
    """
    
    def __init__(self):
        """Initialize the OpenAI client"""
        # the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        # do not change this unless explicitly requested by the user
        self.model = "gpt-4o"
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            self.client = None
        else:
            try:
                self.client = OpenAI(api_key=api_key)
            except Exception as e:
                self.client = None
    
    def generate_response(self, prompt: str, messages: List[Dict[str, Any]], 
                         notebook_content: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a response from OpenAI
        
        Args:
            prompt: Current prompt/question from the user
            messages: Chat history
            notebook_content: Content of the notebook including code cells and outputs
            
        Returns:
            Dict with LLM response
        """
        # Check if client is None (API key not set or invalid)
        if self.client is None:
            return {
                "content": "Error: OpenAI API key is not set or is invalid. Please provide a valid API key in the settings.",
                "has_code": False,
                "model": self.model,
                "provider": "OpenAI",
                "error": True
            }
            
        # Format notebook content
        notebook_context = self.format_notebook_context(notebook_content)
        
        # Prepare the system message with instructions
        system_message = {
            "role": "system",
            "content": (
                "You are an expert coding assistant in JupyterLab. You have access to the current notebook "
                "content and chat history. Provide helpful, concise responses to code-related questions. "
                "When providing code suggestions, ensure they are correct, well-documented, and follow best practices. "
                "You can reference specific cells from the notebook in your responses. "
                "For code suggestions, wrap the code in ```python and ``` tags."
            )
        }
        
        # Format the user message with notebook context and prompt
        user_message = {
            "role": "user",
            "content": f"Current notebook:\n{notebook_context}\n\nUser request: {prompt}"
        }
        
        # Convert previous messages to OpenAI format
        formatted_messages = [system_message]
        for msg in messages:
            formatted_messages.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", "")
            })
        
        # Add the current message
        formatted_messages.append(user_message)
        
        # Generate response from OpenAI
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=formatted_messages
            )
            
            content = response.choices[0].message.content
            return {
                "content": content,
                "has_code": "```" in content,
                "model": self.model,
                "provider": "OpenAI"
            }
        except Exception as e:
            return {
                "content": f"Error generating response: {str(e)}",
                "has_code": False,
                "model": self.model,
                "provider": "OpenAI",
                "error": True
            }
    
    def fix_errors(self, code: str, errors: List[Dict[str, Any]]) -> str:
        """
        Fix errors in the code using OpenAI
        
        Args:
            code: The code with errors
            errors: List of error messages and details
            
        Returns:
            Fixed code as a string
        """
        # Check if client is None (API key not set or invalid)
        if self.client is None:
            return f"# Error: OpenAI API key is not set or is invalid. Please provide a valid API key in the settings.\n{code}"
            
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
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert Python code debugger. When provided code with errors, fix the errors and return only the corrected code without explanations or markdown formatting."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            
            fixed_code = response.choices[0].message.content
            
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
            "name": "OpenAI ChatGPT",
            "id": "openai",
            "default_model": self.model,
            "models": [
                {"id": "gpt-4o", "name": "GPT-4o"},
                {"id": "gpt-3.5-turbo", "name": "GPT-3.5 Turbo"}
            ]
        }
