from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional


class BaseLLM(ABC):
    """
    Base class for LLM implementations
    """
    
    @abstractmethod
    def generate_response(self, prompt: str, messages: List[Dict[str, Any]], 
                         notebook_content: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a response from the LLM
        
        Args:
            prompt: Current prompt/question from the user
            messages: Chat history
            notebook_content: Content of the notebook including code cells and outputs
            
        Returns:
            Dict with LLM response
        """
        pass
    
    @abstractmethod
    def fix_errors(self, code: str, errors: List[Dict[str, Any]]) -> str:
        """
        Fix errors in the code
        
        Args:
            code: The code with errors
            errors: List of error messages and details
            
        Returns:
            Fixed code as a string
        """
        pass
    
    @abstractmethod
    def get_config(self) -> Dict[str, Any]:
        """
        Get configuration for this LLM
        
        Returns:
            Dictionary with configuration details
        """
        pass
    
    def format_notebook_context(self, notebook_content: Dict[str, Any]) -> str:
        """
        Format notebook content into a string representation
        
        Args:
            notebook_content: Dictionary containing cells, outputs, and other notebook content
            
        Returns:
            String representation of the notebook
        """
        formatted_content = []
        
        for idx, cell in enumerate(notebook_content.get('cells', [])):
            cell_type = cell.get('cell_type', '')
            source = cell.get('source', '')
            
            if cell_type == 'code':
                formatted_content.append(f"Cell [{idx}] (Code):\n```python\n{source}\n```")
                
                # Add outputs if available
                outputs = cell.get('outputs', [])
                if outputs:
                    output_text = []
                    for output in outputs:
                        if 'text/plain' in output.get('data', {}):
                            output_text.append(output['data']['text/plain'])
                        elif 'text' in output:
                            output_text.append(output['text'])
                        elif 'traceback' in output:
                            output_text.append('\n'.join(output['traceback']))
                    
                    if output_text:
                        formatted_content.append(f"Output:\n```\n{''.join(output_text)}\n```")
            
            elif cell_type == 'markdown':
                formatted_content.append(f"Cell [{idx}] (Markdown):\n{source}")
        
        return '\n\n'.join(formatted_content)
