import React, { useState } from 'react';

interface ErrorFixerProps {
  originalCode: string;
  fixedCode: string;
  cellIndex: number;
  onApplyFix: (code: string, cellIndex: number) => void;
  onDismiss: () => void;
}

export const ErrorFixer: React.FC<ErrorFixerProps> = ({
  originalCode,
  fixedCode,
  cellIndex,
  onApplyFix,
  onDismiss
}) => {
  const [showDiff, setShowDiff] = useState(false);
  
  // Generate a simple diff view
  const generateDiff = () => {
    const originalLines = originalCode.split('\n');
    const fixedLines = fixedCode.split('\n');
    
    // Very simple line comparison - could be improved with a proper diff algorithm
    return (
      <div className="jp-AIAssistant-codeDiff">
        <div className="jp-AIAssistant-diffTitle">Changes:</div>
        <div className="jp-AIAssistant-diffContainer">
          <div className="jp-AIAssistant-diffOriginal">
            <div className="jp-AIAssistant-diffHeader">Original</div>
            {originalLines.map((line, i) => (
              <div key={`orig-${i}`} className="jp-AIAssistant-diffLine">
                {line}
              </div>
            ))}
          </div>
          <div className="jp-AIAssistant-diffFixed">
            <div className="jp-AIAssistant-diffHeader">Fixed</div>
            {fixedLines.map((line, i) => (
              <div key={`fix-${i}`} className="jp-AIAssistant-diffLine">
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="jp-AIAssistant-errorFixer">
      <div className="jp-AIAssistant-errorFixerHeader">
        <span>Error Fix for Cell {cellIndex + 1}</span>
        <button
          className="jp-Button jp-mod-styled jp-AIAssistant-diffToggle"
          onClick={() => setShowDiff(!showDiff)}
        >
          {showDiff ? 'Hide Diff' : 'Show Diff'}
        </button>
      </div>
      
      {showDiff ? (
        generateDiff()
      ) : (
        <div className="jp-AIAssistant-code">
          <code>{fixedCode}</code>
        </div>
      )}
      
      <div className="jp-AIAssistant-errorFixerActions">
        <button
          className="jp-Button jp-mod-styled jp-mod-accept jp-AIAssistant-errorFixButton"
          onClick={() => onApplyFix(fixedCode, cellIndex)}
        >
          Apply Fix
        </button>
        <button
          className="jp-Button jp-mod-styled jp-AIAssistant-errorFixButton"
          onClick={onDismiss}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};
