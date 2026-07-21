import { Context } from './context';
import { Storage } from './storage';
import type { Operation } from './operation';
import type { Direction } from '../shared/types';
import { GoBackOperation } from './operations/go-back-operation';
import { GoForwardOperation } from './operations/go-forward-operation';
import { OpenNewTabOperation } from './operations/open-new-tab-operation';
import { CloseCurrentTabOperation } from './operations/close-current-tab-operation';
import { ReloadCurrentTabOperation } from './operations/reload-current-tab-operation';
import { SwitchToLeftTabOperation } from './operations/switch-to-left-tab-operation';
import { SwitchToRightTabOperation } from './operations/switch-to-right-tab-operation';
import { CloseWindowOperation } from './operations/close-window-operation';
import { MinimizeWindowOperation } from './operations/minimize-window-operation';
import { ScrollToTopOperation } from './operations/scroll-to-top-operation';
import { ScrollToBottomOperation } from './operations/scroll-to-bottom-operation';
import { ReopenTabOperation } from './operations/reopen-tab-operation';
import { DuplicateTabOperation } from './operations/duplicate-tab-operation';
import { OpenNewWindowOperation } from './operations/open-new-window-operation';
import { SearchHighlightedTextOperation } from './operations/search-highlighted-text-operation';
import { CloseTabsToRightOperation } from './operations/close-tabs-to-right-operation';

interface OperationEntry {
  operation: Operation;
  label: string;
}

export class OperationResolver {
  #storage: Storage;

  static operations: Record<string, OperationEntry> = {
    goBack: {
      operation: new GoBackOperation(),
      label: 'Go Back',
    },
    goForward: {
      operation: new GoForwardOperation(),
      label: 'Go Forward',
    },
    openNewTab: {
      operation: new OpenNewTabOperation(false),
      label: 'Open New Tab',
    },
    openLinkInNewTab: {
      operation: new OpenNewTabOperation(true),
      label: 'Open Link in New Tab',
    },
    closeCurrentTab: {
      operation: new CloseCurrentTabOperation(),
      label: 'Close Current Tab',
    },
    reloadCurrentTab: {
      operation: new ReloadCurrentTabOperation(),
      label: 'Reload Current Tab',
    },
    switchToLeftTab: {
      operation: new SwitchToLeftTabOperation(),
      label: 'Switch to Left Tab',
    },
    switchToRightTab: {
      operation: new SwitchToRightTabOperation(),
      label: 'Switch to Right Tab',
    },
    closeWindow: {
      operation: new CloseWindowOperation(),
      label: 'Close Window',
    },
    minimizeWindow: {
      operation: new MinimizeWindowOperation(),
      label: 'Minimize Window',
    },
    scrollToTop: {
      operation: new ScrollToTopOperation(),
      label: 'Scroll to Top',
    },
    scrollToBottom: {
      operation: new ScrollToBottomOperation(),
      label: 'Scroll to Bottom',
    },
    reopenTab: {
      operation: new ReopenTabOperation(),
      label: 'Reopen Tab',
    },
    duplicateTab: {
      operation: new DuplicateTabOperation(),
      label: 'Duplicate Tab',
    },
    openNewWindow: {
      operation: new OpenNewWindowOperation(),
      label: 'Open New Window',
    },
    searchHighlightedTextInActiveTab: {
      operation: new SearchHighlightedTextOperation(true),
      label: 'Search Highlighted Text in Active Tab',
    },
    searchHighlightedTextInInactiveTab: {
      operation: new SearchHighlightedTextOperation(false),
      label: 'Search Highlighted Text in Inactive Tab',
    },
    closeTabsToRight: {
      operation: new CloseTabsToRightOperation(),
      label: 'Close Tabs to the Right',
    },
  };

  constructor(storage: Storage) {
    this.#storage = storage;
  }

  async resolveAsync(context: Context) {
    const serializedGestures = this.#serializeGestures(context.gestures);

    const operationKey = this.#storage.getOperationKey(serializedGestures);
    if (operationKey === undefined) {
      return;
    }

    if (!OperationResolver.operations.hasOwnProperty(operationKey)) {
      return;
    }

    const element = OperationResolver.operations[operationKey];
    try {
      await element.operation.doAsync(context);
    } catch (error) {
      console.error(`Operation '${operationKey}' failed`, error);
    }
  }

  #serializeGestures(gestures: Direction[]) {
    return gestures.join('|');
  }
}
