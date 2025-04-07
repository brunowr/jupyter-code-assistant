from ._version import __version__
from .handlers import setup_handlers


def _jupyter_server_extension_paths():
    return [{
        "module": "jupyterlab_ai_assistant"
    }]


def load_jupyter_server_extension(nb_server_app):
    """
    Called when the extension is loaded.
    
    Args:
        nb_server_app (NotebookServerApp): handle to the Notebook server instance.
    """
    setup_handlers(nb_server_app.web_app)
