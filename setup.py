#!/usr/bin/env python
from setuptools import setup, find_packages

setup(
    name="jupyterlab_ai_assistant",
    version="0.1.0",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    install_requires=[
        "jupyterlab>=4.0.0",
        "jupyter_server>=2.0.0",
        "openai>=1.0.0",
        "anthropic>=0.5.0",
        "google-generativeai>=0.3.0",
        "requests>=2.25.0",
    ],
    author="AI Assistant Developer",
    author_email="example@example.com",
    description="JupyterLab extension providing an AI code assistant with multiple LLM support",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    url="https://github.com/username/jupyterlab_ai_assistant",
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Framework :: Jupyter",
        "Framework :: Jupyter :: JupyterLab",
        "Framework :: Jupyter :: JupyterLab :: 4",
        "Framework :: Jupyter :: Extensions",
        "Framework :: Jupyter :: Extensions :: Server",
    ],
    python_requires=">=3.9",
    # Register the server extension
    entry_points={
        "jupyter_server.extensions": [
            "jupyterlab_ai_assistant = jupyterlab_ai_assistant:_jupyter_server_extension_points"
        ]
    },
)
