import os
import json
from typing import Dict, List, Any, Optional
import anthropic
from anthropic import Anthropic
from .base import BaseLLM


class AnthropicLLM(BaseLLM):
    """
    Anthropic Claude LLM implementation
    """
    
    def __init__(self):
        """Initialize the Anthropic client"""
        # the newest Anthropic model is "claude-3-5-sonnet-20241022" which was released October 22, 2024
        # do not change this unless explicitly requested by the user
        self.model = "claude-3-5-sonnet-20241022"
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            self.client = None
        else:
            try:
                self.client = Anthropic(api_key=api_key)
            except Exception as e:
                self.client = None
    
    def generate_response(self, prompt: str, messages: List[Dict[str, Any]], 
                         notebook_content: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a response from Anthropic Claude
        
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
                "content": "Error: Anthropic API key is not set or is invalid. Please provide a valid API key in the settings.",
                "has_code": False,
                "model": self.model,
                "provider": "Anthropic",
                "error": True
            }
            
        # Format notebook content
        notebook_context = self.format_notebook_context(notebook_content)
        
        # Prepare the system message with instructions
        system_prompt = (
            "You are an expert coding assistant in JupyterLab. You have access to the current notebook "
            "content and chat history. Provide helpful, concise responses to code-related questions. "
            "When providing code suggestions, ensure they are correct, well-documented, and follow best practices. "
            "You can reference specific cells from the notebook in your responses. "
            "For code suggestions, wrap the code in ```python and ``` tags."
        )
        
        # Format Claude messages
        claude_messages = []
        
        # Add previous messages
        for msg in messages:
            role = msg.get("role", "user")
            if role == "assistant":
                role = "assistant"
            else:
                role = "user"
            
            claude_messages.append({
                "role": role,
                "content": msg.get("content", "")
            })
        
        # Add current message with notebook context
        claude_messages.append({
            "role": "user",
            "content": f"Current notebook:\n{notebook_context}\n\nUser request: {prompt}"
        })
        
        # Generate response from Claude
        try:
            response = self.client.messages.create(
                model=self.model,
                system=system_prompt,
                messages=claude_messages,
                max_tokens=4000
            )
            
            content = response.content[0].text
            return {
                "content": content,
                "has_code": "```" in content,
                "model": self.model,
                "provider": "Anthropic"
            }
        except Exception as e:
            return {
                "content": f"Error generating response: {str(e)}",
                "has_code": False,
                "model": self.model,
                "provider": "Anthropic",
                "error": True
            }
    
    def fix_errors(self, code: str, errors: List[Dict[str, Any]]) -> str:
        """
        Fix errors in the code using Claude
        
        Args:
            code: The code with errors
            errors: List of error messages and details
            
        Returns:
            Fixed code as a string
        """
        # Check if client is None (API key not set or invalid)
        if self.client is None:
            return f"# Error: Anthropic API key is not set or is invalid. Please provide a valid API key in the settings.\n{code}"
            
        error_text = "\n".join([f"Error {i+1}: {error.get('message', '')}" 
                               for i, error in enumerate(errors)])
        
        user_message = f"""
        Fix the following Python code that has errors:
        
        ```python
        {code}
        ```
        
        Errors:
        {error_text}
        
        Provide only the fixed code without explanations.
        """
        
        try:
            response = self.client.messages.create(
                model=self.model,
                system="You are an expert Python code debugger. When provided code with errors, fix the errors and return only the corrected code without explanations or markdown formatting.",
                messages=[
                    {
                        "role": "user",
                        "content": user_message
                    }
                ],
                max_tokens=2000
            )
            
            fixed_code = response.content[0].text
            
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
            "name": "Anthropic Claude",
            "id": "anthropic",
            "default_model": self.model,
            "models": [
                {"id": "claude-3-5-sonnet-20241022", "name": "Claude 3.5 Sonnet"},
                {"id": "claude-3-opus-20240229", "name": "Claude 3 Opus"},
                {"id": "claude-3-sonnet-20240229", "name": "Claude 3 Sonnet"},
                {"id": "claude-3-haiku-20240307", "name": "Claude 3 Haiku"}
            ]
        }
