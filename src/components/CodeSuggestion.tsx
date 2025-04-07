import React from 'react';

interface CodeSuggestionProps {
  code: string;
  onApplyCode: (code: string) => void;
  onAddNewCell: (code: string) => void;
  onCopyCode: (code: string) => void;
}

export const CodeSuggestion: React.FC<CodeSuggestionProps> = ({
  code,
  onApplyCode,
  onAddNewCell,
  onCopyCode
}) => {
  return (
    <div>
      <pre className="jp-AIAssistant-code">
        <code>{code}</code>
      </pre>
      <div className="jp-AIAssistant-codeActions">
        <button
          className="jp-AIAssistant-codeAction"
          onClick={() => onCopyCode(code)}
          title="Copy to clipboard"
        >
          Copy
        </button>
        <button
          className="jp-AIAssistant-codeAction"
          onClick={() => onApplyCode(code)}
          title="Apply to the current cell"
        >
          Apply to Cell
        </button>
        <button
          className="jp-AIAssistant-codeAction"
          onClick={() => onAddNewCell(code)}
          title="Add as a new cell"
        >
          Add New Cell
        </button>
      </div>
    </div>
  );
};
