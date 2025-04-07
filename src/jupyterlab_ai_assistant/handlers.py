import json
import tornado
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado.web

from .llm import get_llm_instance


class LLMHandler(APIHandler):
    @tornado.web.authenticated
    def post(self):
        """Handle LLM request"""
        data = json.loads(self.request.body.decode('utf-8'))
        llm_type = data.get('llm_type', 'openai')
        prompt = data.get('prompt', '')
        messages = data.get('messages', [])
        notebook_content = data.get('notebook_content', {})
        
        llm = get_llm_instance(llm_type)
        response = llm.generate_response(prompt, messages, notebook_content)
        
        self.finish(json.dumps(response))


class ErrorFixHandler(APIHandler):
    @tornado.web.authenticated
    def post(self):
        """Handle error fixing request"""
        data = json.loads(self.request.body.decode('utf-8'))
        llm_type = data.get('llm_type', 'openai')
        errors = data.get('errors', [])
        code = data.get('code', '')
        
        llm = get_llm_instance(llm_type)
        fixed_code = llm.fix_errors(code, errors)
        
        self.finish(json.dumps({'fixed_code': fixed_code}))


class LLMConfigHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        """Return LLM configuration"""
        config = {
            'available_models': [
                {'id': 'openai', 'name': 'OpenAI ChatGPT', 'default_model': 'gpt-4o'},
                {'id': 'anthropic', 'name': 'Anthropic Claude', 'default_model': 'claude-3-5-sonnet-20241022'},
                {'id': 'gemini', 'name': 'Google Gemini', 'default_model': 'gemini-pro'},
                {'id': 'ollama', 'name': 'Ollama', 'default_model': 'llama3', 'local': True}
            ]
        }
        self.finish(json.dumps(config))


def setup_handlers(web_app):
    """Setup handlers for the AI assistant extension"""
    host_pattern = ".*$"
    base_url = web_app.settings["base_url"]
    
    handlers = [
        (url_path_join(base_url, "ai-assistant", "llm"), LLMHandler),
        (url_path_join(base_url, "ai-assistant", "fix-error"), ErrorFixHandler),
        (url_path_join(base_url, "ai-assistant", "config"), LLMConfigHandler)
    ]
    
    web_app.add_handlers(host_pattern, handlers)
