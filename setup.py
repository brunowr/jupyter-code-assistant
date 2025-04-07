#!/usr/bin/env python
from setuptools import setup, find_packages

setup(
    name="jupyterlab_ai_assistant",
    version="0.1.0",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    install_requires=[
        "jupyterlab>=3.0.0,<4.0.0",
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
    ],
    python_requires=">=3.7",
)
