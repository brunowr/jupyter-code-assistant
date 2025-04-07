/**
 * Copy text to the clipboard
 */
export function copyToClipboard(text: string): Promise<void> {
  // Use the newer Clipboard API if available
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text)
      .catch(error => {
        console.error('Failed to copy to clipboard:', error);
        return fallbackCopyToClipboard(text);
      });
  }
  
  // Fall back to older method
  return fallbackCopyToClipboard(text);
}

/**
 * Fallback method to copy text to the clipboard using a temporary textarea element
 */
function fallbackCopyToClipboard(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Create a temporary textarea element
      const textarea = document.createElement('textarea');
      textarea.value = text;
      
      // Make it invisible
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      textarea.style.top = '0';
      
      // Add it to the document
      document.body.appendChild(textarea);
      
      // Select and copy the text
      textarea.select();
      document.execCommand('copy');
      
      // Clean up
      document.body.removeChild(textarea);
      
      resolve();
    } catch (error) {
      console.error('Fallback clipboard copy failed:', error);
      reject(error);
    }
  });
}
