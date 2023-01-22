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
  #operations = {
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

  #map = {
    'left': 'goBack',
    'right': 'goForward',
    'up': 'openNewTab',
    'down': 'closeCurrentTab',
    'up|down': 'reloadCurrentTab',
    'up|left': 'switchToLeftTab',
    'up|right': 'switchToRightTab',
    'left|down|right': 'closeWindow',
    'down|left': 'minimizeWindow'
  }

  getList() {
    const elements = [];
    for (const operationKey in this.#operations) {
      if (Object.hasOwnProperty.call(this.#operations, operationKey)) {
        const element = this.#operations[operationKey];
        elements.push({
          value: operationKey,
          label: element.label
        });
      }
    }

    return elements;
  }

  async resolveAsync(directions) {
    const serializedDirections = this.#serializeDirections(directions);

    if (!this.#map.hasOwnProperty(serializedDirections)) {
      console.warn(serializedDirections);

      return;
    }

    if (!this.#operations.hasOwnProperty(this.#map[serializedDirections])) {
      console.warn(serializedDirections);
      
      return;
    }

    const el = this.#operations[this.#map[serializedDirections]];
    el.isAsync ? await el.operation.doAsync() : el.operation.do();
  }

  #serializeDirections(directions) {
    return directions.join('|');
  }
}