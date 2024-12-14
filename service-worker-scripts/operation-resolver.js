import { GoBackOperation } from '/service-worker-scripts/operations/go-back-operation.js';
import { GoForwardOperation } from '/service-worker-scripts/operations/go-forward-operation.js';
import { OpenNewTabOperation } from '/service-worker-scripts/operations/open-new-tab-operation.js';
import { CloseCurrentTabOperation } from '/service-worker-scripts/operations/close-current-tab-operation.js';
import { ReloadCurrentTabOperation } from '/service-worker-scripts/operations/reload-current-tab-operation.js';
import { SwitchToLeftTabOperation } from '/service-worker-scripts/operations/switch-to-left-tab-operation.js';
import { SwitchToRightTabOperation } from '/service-worker-scripts/operations/switch-to-right-tab-operation.js';
import { CloseWindowOperation } from '/service-worker-scripts/operations/close-window-operation.js';
import { MinimizeWindowOperation } from '/service-worker-scripts/operations/minimize-window-operation.js';
import { ScrollToTopOperation } from '/service-worker-scripts/operations/scroll-to-top-operation.js';
import { ScrollToBottomOperation } from '/service-worker-scripts/operations/scroll-to-bottom-operation.js';
import { ReopenTabOperation } from '/service-worker-scripts/operations/reopen-tab-operation.js';
import { DuplicateTabOperation } from '/service-worker-scripts/operations/duplicate-tab-operation.js';
import { OpenNewWindowOperation } from '/service-worker-scripts/operations/open-new-window-operation.js';
import { SearchHighlightedTextOperation } from '/service-worker-scripts/operations/search-highlighted-text-operation.js';
import { CloseTabsToRightOperation } from '/service-worker-scripts/operations/close-tabs-to-right-operation.js';

export class OperationResolver {
  #storage;

  static operations = {
    goBack: {
      operation: new GoBackOperation(),
      label: 'Go Back',
    },
    goForward: {
      operation: new GoForwardOperation(),
      label: 'Go Forward',
    },
    openNewTab: {
      operation: new OpenNewTabOperation(),
      label: 'Open New Tab',
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
    }
  };

  constructor(storage) {
    this.#storage = storage;
  }

  async resolveAsync(context) {
    const serializedGestures = this.#serializeGestures(context.gestures);

    const operationKey = this.#storage.getOperationKey(serializedGestures);
    if (operationKey === undefined) {
      return;
    }

    if (!OperationResolver.operations.hasOwnProperty(operationKey)) {
      return;
    }

    const element = OperationResolver.operations[operationKey];
    await element.operation.doAsync(context);
  }

  #serializeGestures(gestures) {
    return gestures.join('|');
  }
}
