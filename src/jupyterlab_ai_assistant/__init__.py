from ._version import __version__
from .handlers import setup_handlers


def _jupyter_server_extension_points():
    """
    Returns a list of dictionaries with metadata describing
    where to find the `_load_jupyter_server_extension` function.
    """
    return [{
        "module": "jupyterlab_ai_assistant"
    }]


# Keep the old function for backwards compatibility
def _jupyter_server_extension_paths():
    return _jupyter_server_extension_points()


def _load_jupyter_server_extension(server_app):
    """
    Called when the extension is loaded.
    
    Args:
        server_app: Jupyter Server application instance
    """
    setup_handlers(server_app.web_app)


# Keep the old function for backwards compatibility
load_jupyter_server_extension = _load_jupyter_server_extension
