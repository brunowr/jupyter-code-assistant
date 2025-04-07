import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { ReactWidget } from '@jupyterlab/apputils';
import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { IThemeManager } from '@jupyterlab/apputils';
import { CommandRegistry } from '@lumino/commands';
import { Message } from './Message';
import { ErrorFixer } from './ErrorFixer';
import { SettingsPanel } from './SettingsPanel';
import { requestAPI } from '../services/LLMService';
import { extractNotebookContent, extractErrorsFromOutputs } from '../services/NotebookService';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  hasCode: boolean;
  model?: string;
  provider?: string;
  error?: boolean;
}

interface LLMConfig {
  id: string;
  name: string;
  models: Array<{id: string, name: string}>;
  defaultModel: string;
  local?: boolean;
}

interface ChatPanelProps {
  notebookTracker: INotebookTracker;
  commands: CommandRegistry;
  settingRegistry: ISettingRegistry | null;
  themeManager: IThemeManager | null;
}

const ChatPanelComponent: React.FC<ChatPanelProps> = ({
  notebookTracker,
  commands,
  settingRegistry,
  themeManager
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedLLM, setSelectedLLM] = useState('openai');
  const [llmConfigs, setLLMConfigs] = useState<LLMConfig[]>([]);
  const [selectedModels, setSelectedModels] = useState<Record<string, string>>({
    openai: 'gpt-4o',
    anthropic: 'claude-3-5-sonnet-20241022',
    gemini: 'gemini-pro',
    ollama: 'llama3'
  });
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    openai: '',
    anthropic: '',
    gemini: ''
  });
  
  const chatRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Load LLM configurations
  useEffect(() => {
    fetchLLMConfig();
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Load settings
  useEffect(() => {
    if (settingRegistry) {
      settingRegistry.load('jupyterlab-ai-assistant:plugin')
        .then(settings => {
          const savedApiKeys = settings.get('apiKeys').composite as Record<string, string>;
          if (savedApiKeys) {
            setApiKeys(savedApiKeys);
          }
          
          const savedSelectedModels = settings.get('selectedModels').composite as Record<string, string>;
          if (savedSelectedModels) {
            setSelectedModels(savedSelectedModels);
          }
          
          const savedSelectedLLM = settings.get('selectedLLM').composite as string;
          if (savedSelectedLLM) {
            setSelectedLLM(savedSelectedLLM);
          }
        })
        .catch(error => {
          console.error('Failed to load settings:', error);
        });
    }
  }, [settingRegistry]);
  
  // Save settings when they change
  useEffect(() => {
    if (settingRegistry) {
      settingRegistry.set('jupyterlab-ai-assistant:plugin', 'apiKeys', apiKeys);
      settingRegistry.set('jupyterlab-ai-assistant:plugin', 'selectedModels', selectedModels);
      settingRegistry.set('jupyterlab-ai-assistant:plugin', 'selectedLLM', selectedLLM);
    }
  }, [apiKeys, selectedModels, selectedLLM, settingRegistry]);
  
  const fetchLLMConfig = async () => {
    try {
      const config = await requestAPI<{available_models: LLMConfig[]}>('config');
      if (config && config.available_models) {
        setLLMConfigs(config.available_models);
      }
    } catch (error) {
      console.error('Error fetching LLM config:', error);
    }
  };
  
  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
      hasCode: false
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setLoading(true);
    
    // Get current notebook content
    const notebookContent = notebookTracker.currentWidget 
      ? extractNotebookContent(notebookTracker.currentWidget.content)
      : {};
    
    try {
      const response = await requestAPI<ChatMessage>('llm', {
        method: 'POST',
        body: JSON.stringify({
          llm_type: selectedLLM,
          prompt: input,
          messages: messages.map(({ role, content }) => ({ role, content })),
          notebook_content: notebookContent
        })
      });
      
      if (response) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.content,
          timestamp: new Date(),
          hasCode: response.hasCode || false,
          model: response.model,
          provider: response.provider,
          error: response.error
        };
        
        setMessages(prevMessages => [...prevMessages, assistantMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Error: Failed to get response from ${selectedLLM}. Please check your API keys and connection.`,
        timestamp: new Date(),
        hasCode: false,
        error: true
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const applyCodeToCell = (code: string) => {
    const notebook = notebookTracker.currentWidget;
    if (!notebook) return;
    
    const activeCell = notebook.content.activeCell;
    if (activeCell) {
      activeCell.model.value.text = code;
    }
  };
  
  const addNewCell = (code: string) => {
    const notebook = notebookTracker.currentWidget;
    if (!notebook) return;
    
    const model = notebook.content.model;
    const activeCell = notebook.content.activeCell;
    
    if (model) {
      const activeCellIndex = notebook.content.activeCellIndex;
      const newCell = model.contentFactory.createCodeCell({});
      newCell.value.text = code;
      
      model.cells.insert(activeCellIndex + 1, newCell);
      
      // Activate the new cell
      notebook.content.activeCellIndex = activeCellIndex + 1;
    }
  };
  
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
  };
  
  const fixLastError = () => {
    const notebook = notebookTracker.currentWidget;
    if (!notebook) return;
    
    const errors = extractErrorsFromOutputs(notebook.content);
    if (errors.length === 0) {
      // No errors found
      addSystemMessage("No errors found in the notebook.");
      return;
    }
    
    // Get the last error
    const lastError = errors[errors.length - 1];
    
    // Add a system message about fixing the error
    addSystemMessage(`Trying to fix error in cell ${lastError.cellIndex + 1}: ${lastError.message}`);
    
    // Request error fix
    fixError(lastError);
  };
  
  const fixAllErrors = () => {
    const notebook = notebookTracker.currentWidget;
    if (!notebook) return;
    
    const errors = extractErrorsFromOutputs(notebook.content);
    if (errors.length === 0) {
      // No errors found
      addSystemMessage("No errors found in the notebook.");
      return;
    }
    
    // Add a system message about fixing all errors
    addSystemMessage(`Found ${errors.length} errors in the notebook. Trying to fix them...`);
    
    // Request error fixes for each error
    errors.forEach(error => {
      fixError(error);
    });
  };
  
  const fixError = async (error: { cellIndex: number, message: string, code: string }) => {
    setLoading(true);
    
    try {
      const response = await requestAPI<{ fixed_code: string }>('fix-error', {
        method: 'POST',
        body: JSON.stringify({
          llm_type: selectedLLM,
          errors: [{ message: error.message }],
          code: error.code
        })
      });
      
      if (response && response.fixed_code) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: `I've fixed the error in cell ${error.cellIndex + 1}:\n\n\`\`\`python\n${response.fixed_code}\n\`\`\``,
          timestamp: new Date(),
          hasCode: true,
          model: selectedModels[selectedLLM],
          provider: getLLMProviderName(selectedLLM)
        };
        
        setMessages(prevMessages => [...prevMessages, assistantMessage]);
        
        // Show the error fixer UI
        // The actual applying of the code will be handled by buttons in the UI
      }
    } catch (error) {
      console.error('Error fixing code:', error);
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Error: Failed to fix the code. Please try again.`,
        timestamp: new Date(),
        hasCode: false,
        error: true
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };
  
  const addSystemMessage = (content: string) => {
    const systemMessage: ChatMessage = {
      id: `system-${Date.now()}`,
      role: 'system',
      content,
      timestamp: new Date(),
      hasCode: false
    };
    
    setMessages(prevMessages => [...prevMessages, systemMessage]);
  };
  
  const getLLMProviderName = (llmId: string): string => {
    const config = llmConfigs.find(c => c.id === llmId);
    return config ? config.name : llmId;
  };
  
  const handleApiKeyChange = (provider: string, key: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: key
    }));
  };
  
  const handleModelChange = (provider: string, model: string) => {
    setSelectedModels(prev => ({
      ...prev,
      [provider]: model
    }));
  };
  
  return (
    <div className="jp-AIAssistant">
      {showSettings ? (
        <SettingsPanel
          llmConfigs={llmConfigs}
          apiKeys={apiKeys}
          selectedModels={selectedModels}
          onApiKeyChange={handleApiKeyChange}
          onModelChange={handleModelChange}
          onClose={() => setShowSettings(false)}
        />
      ) : (
        <>
          <div className="jp-AIAssistant-header">
            <div className="jp-AIAssistant-title">AI Assistant</div>
            <select
              className="jp-AIAssistant-modelSelector"
              value={selectedLLM}
              onChange={(e) => setSelectedLLM(e.target.value)}
            >
              {llmConfigs.map(config => (
                <option key={config.id} value={config.id}>
                  {config.name}
                </option>
              ))}
            </select>
            <button
              className="jp-AIAssistant-settingsButton"
              onClick={() => setShowSettings(true)}
              title="Settings"
            >
              ⚙️
            </button>
          </div>
          
          <div className="jp-AIAssistant-commands">
            <button
              className="jp-Button jp-mod-styled jp-AIAssistant-commandButton"
              onClick={fixLastError}
            >
              Fix Last Error
            </button>
            <button
              className="jp-Button jp-mod-styled jp-AIAssistant-commandButton"
              onClick={fixAllErrors}
            >
              Fix All Errors
            </button>
          </div>
          
          <div className="jp-AIAssistant-chat" ref={chatRef}>
            {messages.map(message => (
              <Message
                key={message.id}
                message={message}
                onApplyCode={applyCodeToCell}
                onAddNewCell={addNewCell}
                onCopyCode={copyToClipboard}
              />
            ))}
            {loading && (
              <div className="jp-AIAssistant-message jp-AIAssistant-assistantMessage">
                <div>Thinking...</div>
              </div>
            )}
          </div>
          
          <div className="jp-AIAssistant-footer">
            <div className="jp-AIAssistant-input">
              <textarea
                className="jp-AIAssistant-textarea"
                placeholder="Ask about your notebook..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                ref={textareaRef}
              />
              <button
                className="jp-Button jp-mod-styled jp-mod-accept jp-AIAssistant-sendButton"
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
              >
                Send
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export class ChatPanel extends ReactWidget {
  private notebookTracker: INotebookTracker;
  private commands: CommandRegistry;
  private settingRegistry: ISettingRegistry | null;
  private themeManager: IThemeManager | null;
  private component: React.RefObject<any>;

  constructor(
    notebookTracker: INotebookTracker,
    commands: CommandRegistry,
    settingRegistry: ISettingRegistry | null,
    themeManager: IThemeManager | null
  ) {
    super();
    this.addClass('jp-AIAssistant');
    this.notebookTracker = notebookTracker;
    this.commands = commands;
    this.settingRegistry = settingRegistry;
    this.themeManager = themeManager;
    this.component = React.createRef();
  }

  render(): JSX.Element {
    return (
      <ChatPanelComponent
        ref={this.component}
        notebookTracker={this.notebookTracker}
        commands={this.commands}
        settingRegistry={this.settingRegistry}
        themeManager={this.themeManager}
      />
    );
  }

  fixLastError(): void {
    if (this.component.current) {
      this.component.current.fixLastError();
    }
  }

  fixAllErrors(): void {
    if (this.component.current) {
      this.component.current.fixAllErrors();
    }
  }
}
