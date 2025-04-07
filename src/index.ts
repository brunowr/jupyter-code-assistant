import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer
} from '@jupyterlab/application';

import {
  ICommandPalette,
  MainAreaWidget,
  WidgetTracker,
  IThemeManager
} from '@jupyterlab/apputils';

import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { Widget } from '@lumino/widgets';
import { CommandRegistry } from '@lumino/commands';

import { ChatPanel } from './components/ChatPanel';

/**
 * The plugin ID
 */
const PLUGIN_ID = 'jupyterlab-ai-assistant:plugin';

/**
 * The command IDs used by the plugin.
 */
namespace CommandIDs {
  export const openChat = 'ai-assistant:open';
  export const fixLastError = 'ai-assistant:fix-last-error';
  export const fixAllErrors = 'ai-assistant:fix-all-errors';
}

/**
 * Initialization data for the jupyterlab-ai-assistant extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  autoStart: true,
  requires: [ICommandPalette, INotebookTracker],
  optional: [ILayoutRestorer, ISettingRegistry, IMainMenu, IThemeManager],
  activate: activatePlugin
};

/**
 * Activate the extension.
 */
function activatePlugin(
  app: JupyterFrontEnd,
  palette: ICommandPalette,
  notebookTracker: INotebookTracker,
  restorer: ILayoutRestorer | null,
  settingRegistry: ISettingRegistry | null,
  mainMenu: IMainMenu | null,
  themeManager: IThemeManager | null
): void {
  console.log('JupyterLab AI Assistant is activated!');

  // Track the widget for restoration
  const tracker = new WidgetTracker<MainAreaWidget<Widget>>({
    namespace: 'ai-assistant'
  });

  // Register the commands
  const { commands } = app;
  
  commands.addCommand(CommandIDs.openChat, {
    label: 'Open AI Assistant',
    execute: () => {
      const content = new ChatPanel(
        notebookTracker,
        commands,
        settingRegistry,
        themeManager
      );
      const widget = new MainAreaWidget<Widget>({ content });
      widget.id = 'ai-assistant-chat';
      widget.title.label = 'AI Assistant';
      widget.title.closable = true;
      
      if (!tracker.has(widget)) {
        tracker.add(widget);
      }
      
      if (!widget.isAttached) {
        app.shell.add(widget, 'right', { rank: 700 });
      }
      
      app.shell.activateById(widget.id);
    }
  });
  
  commands.addCommand(CommandIDs.fixLastError, {
    label: 'Fix Last Error',
    execute: async () => {
      const notebook = notebookTracker.currentWidget;
      if (!notebook) return;
      
      // Find the main widget
      const mainWidget = app.shell.widgets('right').find(
        w => w.id === 'ai-assistant-chat'
      ) as MainAreaWidget<ChatPanel>;
      
      if (mainWidget) {
        (mainWidget.content as ChatPanel).fixLastError();
      } else {
        // Open the AI Assistant first, then fix the error
        await commands.execute(CommandIDs.openChat);
        setTimeout(() => {
          const newMainWidget = app.shell.widgets('right').find(
            w => w.id === 'ai-assistant-chat'
          ) as MainAreaWidget<ChatPanel>;
          if (newMainWidget) {
            (newMainWidget.content as ChatPanel).fixLastError();
          }
        }, 500);
      }
    }
  });
  
  commands.addCommand(CommandIDs.fixAllErrors, {
    label: 'Fix All Errors',
    execute: async () => {
      const notebook = notebookTracker.currentWidget;
      if (!notebook) return;
      
      // Find the main widget
      const mainWidget = app.shell.widgets('right').find(
        w => w.id === 'ai-assistant-chat'
      ) as MainAreaWidget<ChatPanel>;
      
      if (mainWidget) {
        (mainWidget.content as ChatPanel).fixAllErrors();
      } else {
        // Open the AI Assistant first, then fix the errors
        await commands.execute(CommandIDs.openChat);
        setTimeout(() => {
          const newMainWidget = app.shell.widgets('right').find(
            w => w.id === 'ai-assistant-chat'
          ) as MainAreaWidget<ChatPanel>;
          if (newMainWidget) {
            (newMainWidget.content as ChatPanel).fixAllErrors();
          }
        }, 500);
      }
    }
  });
  
  // Add the commands to the palette
  palette.addItem({ command: CommandIDs.openChat, category: 'AI Assistant' });
  palette.addItem({ command: CommandIDs.fixLastError, category: 'AI Assistant' });
  palette.addItem({ command: CommandIDs.fixAllErrors, category: 'AI Assistant' });
  
  // Add commands to the menu
  if (mainMenu) {
    mainMenu.toolsMenu.addGroup([
      { command: CommandIDs.openChat },
      { command: CommandIDs.fixLastError },
      { command: CommandIDs.fixAllErrors }
    ], 10);
  }
  
  // Handle state restoration
  if (restorer) {
    restorer.restore(tracker, {
      command: CommandIDs.openChat,
      name: () => 'ai-assistant'
    });
  }
  
  // Load settings
  if (settingRegistry) {
    settingRegistry
      .load(PLUGIN_ID)
      .then(settings => {
        console.log('AI Assistant settings loaded:', settings.composite);
      })
      .catch(reason => {
        console.error('Failed to load settings for AI Assistant.', reason);
      });
  }
  
  // Open by default
  app.restored.then(() => {
    commands.execute(CommandIDs.openChat);
  });
}

export default plugin;
