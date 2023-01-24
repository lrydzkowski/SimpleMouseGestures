import { GoBackOperation } from '/service-worker-scripts/operations/go-back-operation.js';
import { GoForwardOperation } from '/service-worker-scripts/operations/go-forward-operation.js';
import { OpenNewTabOperation } from '/service-worker-scripts/operations/open-new-tab-operation.js';
import { CloseCurrentTabOperation } from '/service-worker-scripts/operations/close-current-tab-operation.js';
import { ReloadCurrentTabOperation } from '/service-worker-scripts/operations/reload-current-tab-operation.js';
import { SwitchToLeftTabOperation } from '/service-worker-scripts/operations/switch-to-left-tab-operation.js';
import { SwitchToRightTabOperation } from '/service-worker-scripts/operations/switch-to-right-tab-operation.js';
import { CloseWindowOperation } from '/service-worker-scripts/operations/close-window-operation.js';
import { MinimizeWindowOperation } from '/service-worker-scripts/operations/minimize-window-operation.js';

export class OperationResolver {
  #storage;

  static operations = {
    goBack: {
      operation: new GoBackOperation(),
      label: 'Go Back',
      isAsync: false
    },
    goForward: {
      operation: new GoForwardOperation(),
      label: 'Go Forward',
      isAsync: false
    },
    openNewTab: {
      operation: new OpenNewTabOperation(),
      label: 'Open New Tab',
      isAsync: true
    },
    closeCurrentTab: {
      operation: new CloseCurrentTabOperation(),
      label: 'Close Current Tab',
      isAsync: true
    },
    reloadCurrentTab: {
      operation: new ReloadCurrentTabOperation(),
      label: 'Reload Current Tab',
      isAsync: false
    },
    switchToLeftTab: {
      operation: new SwitchToLeftTabOperation(),
      label: 'Switch to Left Tab',
      isAsync: true
    },
    switchToRightTab: {
      operation: new SwitchToRightTabOperation(),
      label: 'Switch to Right Tab',
      isAsync: true
    },
    closeWindow: {
      operation: new CloseWindowOperation(),
      label: 'Close Window',
      isAsync: true
    },
    minimizeWindow: {
      operation: new MinimizeWindowOperation(),
      label: 'Minimize Window',
      isAsync: true
    }
  }

  constructor(storage) {
    this.#storage = storage;
  }

  async resolveAsync(directions) {
    const serializedDirections = this.#serializeDirections(directions);
    console.log(serializedDirections);

    const operationKey = this.#storage.get(serializedDirections);
    console.log(operationKey);
    if (operationKey === undefined) {
      return;
    }

    if (!OperationResolver.operations.hasOwnProperty(operationKey)) {
      return;
    }

    const element = OperationResolver.operations[operationKey];
    console.log(element);
    element.isAsync ? await element.operation.doAsync() : element.operation.do();
  }

  #serializeDirections(directions) {
    return directions.join('|');
  }
}