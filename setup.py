#!/usr/bin/env python
from setuptools import setup, find_packages
import os
from os.path import join as pjoin

HERE = os.path.abspath(os.path.dirname(__file__))

# The name of the project
name = "jupyterlab_ai_assistant"

# Get the version
version = "0.1.0"

# Representative files that should be included in the package
data_files_spec = [
    ("share/jupyter/labextensions/%s" % name, "src/%s/labextension" % name, "**"),
    ("share/jupyter/labextensions/%s" % name, ".", "install.json"),
    ("etc/jupyter/jupyter_server_config.d", "jupyter-config", "*.json"),
]

setup(
    name=name,
    version=version,
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    include_package_data=True,
    install_requires=[
        "jupyterlab>=4.0.0",
        "jupyter_server>=2.0.0",
        "openai>=1.0.0",
        "anthropic>=0.5.0",
        "google-generativeai>=0.3.0",
        "requests>=2.25.0",
        "flask>=2.0.0",
        "gunicorn>=23.0.0",
    ],
    zip_safe=False,
    author="AI Assistant Developer",
    author_email="example@example.com",
    description="JupyterLab extension providing an AI code assistant with multiple LLM support",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    url="https://github.com/username/jupyterlab_ai_assistant",
    keywords=["Jupyter", "JupyterLab", "JupyterLab4", "AI", "assistant", "code"],
    classifiers=[
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Framework :: Jupyter",
        "Framework :: Jupyter :: JupyterLab",
        "Framework :: Jupyter :: JupyterLab :: 4",
        "Framework :: Jupyter :: JupyterLab :: Extensions",
        "Framework :: Jupyter :: JupyterLab :: Extensions :: Prebuilt",
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
