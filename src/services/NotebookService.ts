import { NotebookPanel, Notebook } from '@jupyterlab/notebook';
import { ICellModel } from '@jupyterlab/cells';

interface NotebookContent {
  cells: {
    cell_type: string;
    source: string;
    outputs?: Array<any>;
  }[];
  metadata: any;
}

interface ErrorInfo {
  cellIndex: number;
  message: string;
  code: string;
}

/**
 * Extract notebook content including code cells and outputs
 */
export function extractNotebookContent(notebook: Notebook): NotebookContent {
  const cells = [];
  const metadata = notebook.model?.metadata.toJSON() || {};
  
  for (let i = 0; i < notebook.model!.cells.length; i++) {
    const cell = notebook.model!.cells.get(i);
    
    const cellContent: any = {
      cell_type: cell.type,
      source: cell.value.text
    };
    
    // Extract outputs for code cells
    if (cell.type === 'code') {
      const outputs = (cell as any).outputs?.toJSON();
      if (outputs) {
        cellContent.outputs = outputs;
      }
    }
    
    cells.push(cellContent);
  }
  
  return {
    cells,
    metadata
  };
}

/**
 * Extract errors from notebook cell outputs
 */
export function extractErrorsFromOutputs(notebook: Notebook): ErrorInfo[] {
  const errors: ErrorInfo[] = [];
  
  for (let i = 0; i < notebook.model!.cells.length; i++) {
    const cell = notebook.model!.cells.get(i);
    
    if (cell.type === 'code') {
      const outputs = (cell as any).outputs;
      if (!outputs) continue;
      
      for (let j = 0; j < outputs.length; j++) {
        const output = outputs.get(j);
        
        // Check for error outputs
        if (output.type === 'error') {
          const traceback = output.traceback.join('\n');
          const errorName = output.ename || 'Error';
          const errorValue = output.evalue || '';
          const message = `${errorName}: ${errorValue}`;
          
          errors.push({
            cellIndex: i,
            message,
            code: cell.value.text
          });
          
          // Only record one error per cell
          break;
        }
      }
    }
  }
  
  return errors;
}

/**
 * Apply code to a specific cell
 */
export function applyCellCode(notebook: Notebook, cellIndex: number, code: string): void {
  if (cellIndex >= 0 && cellIndex < notebook.model!.cells.length) {
    const cell = notebook.model!.cells.get(cellIndex);
    cell.value.text = code;
  }
}

/**
 * Add a new code cell after the active cell
 */
export function addNewCodeCell(notebook: Notebook, code: string): void {
  const activeCellIndex = notebook.activeCellIndex;
  const model = notebook.model!;
  
  // Create a new code cell
  const newCell = model.contentFactory.createCodeCell({});
  newCell.value.text = code;
  
  // Insert it after the active cell
  model.cells.insert(activeCellIndex + 1, newCell);
  
  // Activate the new cell
  notebook.activeCellIndex = activeCellIndex + 1;
}
