/**
 * Make a request to the server extension API
 */
export async function requestAPI<T>(
  endpoint: string,
  init: RequestInit = {}
): Promise<T> {
  // Construct the API URL
  const baseUrl = (window as any).jupyterBaseUrl || '';
  const url = `${baseUrl}ai-assistant/${endpoint}`;
  
  // Set default headers
  const headers = init.headers || {};
  init.headers = {
    'Content-Type': 'application/json',
    ...headers
  };
  
  // Make the request
  const response = await fetch(url, init);
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || `Failed to fetch ${url}: ${response.statusText}`);
  }
  
  return await response.json() as T;
}

/**
 * Get available LLM configurations
 */
export async function getLLMConfigs() {
  return requestAPI<{available_models: any[]}>('config');
}

/**
 * Generate a response from the selected LLM
 */
export async function generateResponse(
  llmType: string,
  prompt: string,
  messages: any[],
  notebookContent: any
) {
  return requestAPI('llm', {
    method: 'POST',
    body: JSON.stringify({
      llm_type: llmType,
      prompt,
      messages,
      notebook_content: notebookContent
    })
  });
}

/**
 * Fix code errors using the selected LLM
 */
export async function fixErrors(
  llmType: string,
  code: string,
  errors: any[]
) {
  return requestAPI<{fixed_code: string}>('fix-error', {
    method: 'POST',
    body: JSON.stringify({
      llm_type: llmType,
      code,
      errors
    })
  });
}
