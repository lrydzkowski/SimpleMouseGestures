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

export class OperationResolver {
  #storage;

  static operations = {
    goBack: {
      operation: new GoBackOperation(),
      label: 'Go Back'
    },
    goForward: {
      operation: new GoForwardOperation(),
      label: 'Go Forward'
    },
    openNewTab: {
      operation: new OpenNewTabOperation(),
      label: 'Open New Tab'
    },
    closeCurrentTab: {
      operation: new CloseCurrentTabOperation(),
      label: 'Close Current Tab'
    },
    reloadCurrentTab: {
      operation: new ReloadCurrentTabOperation(),
      label: 'Reload Current Tab'
    },
    switchToLeftTab: {
      operation: new SwitchToLeftTabOperation(),
      label: 'Switch to Left Tab'
    },
    switchToRightTab: {
      operation: new SwitchToRightTabOperation(),
      label: 'Switch to Right Tab'
    },
    closeWindow: {
      operation: new CloseWindowOperation(),
      label: 'Close Window'
    },
    minimizeWindow: {
      operation: new MinimizeWindowOperation(),
      label: 'Minimize Window'
    },
    scrollToTop: {
      operation: new ScrollToTopOperation(),
      label: 'Scroll to top'
    },
    scrollToBottom: {
      operation: new ScrollToBottomOperation(),
      label: 'Scroll to bottom'
    }   
  }

  constructor(storage) {
    this.#storage = storage;
  }

  async resolveAsync(gestures) {
    const serializedGestures = this.#serializeGestures(gestures);
    console.debug(serializedGestures);

    const operationKey = this.#storage.get(serializedGestures);
    console.debug(operationKey);
    if (operationKey === undefined) {
      return;
    }

    if (!OperationResolver.operations.hasOwnProperty(operationKey)) {
      return;
    }

    const element = OperationResolver.operations[operationKey];
    console.debug(element);
    await element.operation.doAsync();
  }

  #serializeGestures(gestures) {
    return gestures.join('|');
  }
}
