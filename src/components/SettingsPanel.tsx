import React from 'react';

interface LLMConfig {
  id: string;
  name: string;
  models: Array<{id: string, name: string}>;
  defaultModel: string;
  local?: boolean;
}

interface SettingsPanelProps {
  llmConfigs: LLMConfig[];
  apiKeys: Record<string, string>;
  selectedModels: Record<string, string>;
  onApiKeyChange: (provider: string, key: string) => void;
  onModelChange: (provider: string, model: string) => void;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  llmConfigs,
  apiKeys,
  selectedModels,
  onApiKeyChange,
  onModelChange,
  onClose
}) => {
  return (
    <div className="jp-AIAssistant-settings">
      <h3>AI Assistant Settings</h3>
      
      {llmConfigs.map(config => (
        <div key={config.id} className="jp-AIAssistant-settingsGroup">
          <h4>{config.name}</h4>
          
          {!config.local && (
            <div className="jp-AIAssistant-settingsRow">
              <div className="jp-AIAssistant-settingsLabel">API Key:</div>
              <div className="jp-AIAssistant-settingsValue">
                <input
                  type="password"
                  className="jp-AIAssistant-apiKeyInput"
                  value={apiKeys[config.id] || ''}
                  onChange={(e) => onApiKeyChange(config.id, e.target.value)}
                  placeholder={`Enter your ${config.name} API key`}
                />
              </div>
            </div>
          )}
          
          <div className="jp-AIAssistant-settingsRow">
            <div className="jp-AIAssistant-settingsLabel">Model:</div>
            <div className="jp-AIAssistant-settingsValue">
              <select
                value={selectedModels[config.id] || config.defaultModel}
                onChange={(e) => onModelChange(config.id, e.target.value)}
              >
                {config.models.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {config.local && (
            <div className="jp-AIAssistant-settingsRow">
              <div className="jp-AIAssistant-settingsValue" style={{ color: 'var(--jp-content-font-color2)' }}>
                Local model - no API key required
              </div>
            </div>
          )}
        </div>
      ))}
      
      <div style={{ marginTop: '16px', textAlign: 'right' }}>
        <button
          className="jp-Button jp-mod-styled jp-mod-accept"
          onClick={onClose}
        >
          Save & Close
        </button>
      </div>
    </div>
  );
};
