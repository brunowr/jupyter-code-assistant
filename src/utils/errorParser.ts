/**
 * Parse Python error message to extract key details
 */
export function parseErrorMessage(errorText: string): {
  errorType: string;
  errorMessage: string;
  lineNumber?: number;
  columnNumber?: number;
} {
  // Default error information
  const defaultResult = {
    errorType: 'Error',
    errorMessage: errorText.trim()
  };
  
  // Try to extract error type and message
  const typeMatch = errorText.match(/^([A-Za-z]+Error):\s*(.*?)(?:\n|$)/);
  if (typeMatch) {
    defaultResult.errorType = typeMatch[1];
    defaultResult.errorMessage = typeMatch[2];
  }
  
  // Try to extract line and column numbers
  const lineMatch = errorText.match(/line\s+(\d+)(?:,\s*column\s+(\d+))?/i);
  if (lineMatch) {
    const result = { ...defaultResult };
    result.lineNumber = parseInt(lineMatch[1], 10);
    
    if (lineMatch[2]) {
      result.columnNumber = parseInt(lineMatch[2], 10);
    }
    
    return result;
  }
  
  return defaultResult;
}

/**
 * Check if an output contains an error
 */
export function isErrorOutput(output: any): boolean {
  if (!output) return false;
  
  // Check for explicit error output type
  if (output.output_type === 'error' || output.ename || output.evalue) {
    return true;
  }
  
  // Check for error-like patterns in text output
  if (output.text) {
    const text = Array.isArray(output.text) ? output.text.join('') : output.text;
    return text.includes('Error:') || text.includes('Exception:');
  }
  
  return false;
}

/**
 * Extract error message from Jupyter cell output
 */
export function extractErrorFromOutput(output: any): string | null {
  if (!output) return null;
  
  // Direct error output
  if (output.output_type === 'error' && output.ename && output.evalue) {
    if (output.traceback && Array.isArray(output.traceback)) {
      return output.traceback.join('\n');
    }
    return `${output.ename}: ${output.evalue}`;
  }
  
  // Check text output for error patterns
  if (output.text) {
    const text = Array.isArray(output.text) ? output.text.join('') : output.text;
    const errorMatch = text.match(/((?:[A-Za-z]+Error|Exception):[^\n]*(?:\n\s+[^\n]*)*)/);
    if (errorMatch) {
      return errorMatch[1];
    }
  }
  
  return null;
}
