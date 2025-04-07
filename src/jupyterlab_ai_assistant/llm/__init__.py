from .base import BaseLLM
from .openai import OpenAILLM
from .anthropic import AnthropicLLM
from .gemini import GeminiLLM
from .ollama import OllamaLLM

def get_llm_instance(llm_type: str) -> BaseLLM:
    """
    Factory function to get LLM instance based on the type
    
    Args:
        llm_type: The type of LLM to initialize
        
    Returns:
        BaseLLM: An instance of the requested LLM
    """
    if llm_type == 'openai':
        return OpenAILLM()
    elif llm_type == 'anthropic':
        return AnthropicLLM()
    elif llm_type == 'gemini':
        return GeminiLLM()
    elif llm_type == 'ollama':
        return OllamaLLM()
    else:
        # Default to OpenAI if type is not recognized
        return OpenAILLM()
