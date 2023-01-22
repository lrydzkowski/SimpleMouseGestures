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
  async resolveAsync(directions) {
    const serializedDirections = this.#serializeDirections(directions);

    switch (serializedDirections) {
      case 'left':
        new GoBackOperation().do();
        break;
      case 'right':
        new GoForwardOperation().do();
        break;
      case 'up':
        await new OpenNewTabOperation().doAsync();
        break;
      case 'down':
        await new CloseCurrentTabOperation().doAsync();
        break;
      case 'up|down':
        new ReloadCurrentTabOperation().do();
        break;
      case 'up|left':
        await new SwitchToLeftTabOperation().doAsync();
        break;
      case 'up|right':
        await new SwitchToRightTabOperation().doAsync();
        break;
      case 'left|down|right':
        await new CloseWindowOperation().doAsync();
        break;
      case 'down|left':
        await new MinimizeWindowOperation().doAsync();
        break;
    }
  }

  #serializeDirections(directions) {
    return directions.join('|');
  }
}