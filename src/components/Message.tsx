import React from 'react';
import ReactMarkdown from 'react-markdown';
import { CodeSuggestion } from './CodeSuggestion';

interface MessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    hasCode: boolean;
    model?: string;
    provider?: string;
    error?: boolean;
  };
  onApplyCode: (code: string) => void;
  onAddNewCell: (code: string) => void;
  onCopyCode: (code: string) => void;
}

export const Message: React.FC<MessageProps> = ({
  message,
  onApplyCode,
  onAddNewCell,
  onCopyCode
}) => {
  // Extract code blocks from markdown
  const codeBlocks: string[] = [];
  const contentWithoutCodeBlocks = message.content.replace(
    /```(python)?([\s\S]*?)```/g,
    (match, lang, code) => {
      codeBlocks.push(code.trim());
      return '{{CODE_BLOCK_' + (codeBlocks.length - 1) + '}}';
    }
  );

  // Split content by code block placeholders
  const contentParts = contentWithoutCodeBlocks.split(
    /({{CODE_BLOCK_\d+}})/g
  );

  // Determine message class based on role
  let messageClass = 'jp-AIAssistant-message';
  if (message.role === 'user') {
    messageClass += ' jp-AIAssistant-userMessage';
  } else if (message.role === 'assistant') {
    messageClass += ' jp-AIAssistant-assistantMessage';
  } else {
    messageClass += ' jp-AIAssistant-systemMessage';
  }

  // Add error class if applicable
  if (message.error) {
    messageClass += ' jp-AIAssistant-errorMessage';
  }

  return (
    <div className={messageClass}>
      {message.provider && message.model && (
        <div style={{ fontSize: 'smaller', color: 'var(--jp-content-font-color2)', marginBottom: '4px' }}>
          {message.provider} - {message.model}
        </div>
      )}
      
      {contentParts.map((part, index) => {
        if (part.match(/{{CODE_BLOCK_(\d+)}}/)) {
          const blockIndex = parseInt(part.match(/{{CODE_BLOCK_(\d+)}}/)?.[1] || '0');
          const code = codeBlocks[blockIndex];
          
          return (
            <CodeSuggestion
              key={`code-${index}`}
              code={code}
              onApplyCode={onApplyCode}
              onAddNewCell={onAddNewCell}
              onCopyCode={onCopyCode}
            />
          );
        } else {
          return (
            <div key={`text-${index}`} className="jp-AIAssistant-markdown">
              <ReactMarkdown>{part}</ReactMarkdown>
            </div>
          );
        }
      })}
      
      <div style={{ fontSize: 'smaller', color: 'var(--jp-content-font-color2)', marginTop: '4px', textAlign: 'right' }}>
        {message.timestamp.toLocaleTimeString()}
      </div>
    </div>
  );
};
