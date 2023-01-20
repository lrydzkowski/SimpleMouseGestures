const directionsHandler = new DirectionsHandler();
directionsHandler.registerEvent();
const canvasBuilder = new CanvasBuilder();
const canvas = canvasBuilder.build();
const canvasEventHandler = new CanvasEventHandler(canvas);
canvasEventHandler.registerEvent();
const canvasHandler = new CanvasHandler(canvasEventHandler, canvas);

addEventListener('mousedown', (event) => {
  if (event.button !== Consts.rightButton) {
    return;
  }

  directionsHandler.initPosition(event);
  canvasHandler.addToDom();
});

addEventListener('mouseup', (event) => {
  if (event.button !== Consts.rightButton) {
    return;
  }

  canvasHandler.removeFromDom();
});

addEventListener('contextmenu', (event) => {
  if (event.button !== Consts.rightButton) {
    return;
  }

  const directions = directionsHandler.getDirections();
  if (directions.length === 0) {
    return;
  }

  event.preventDefault();
  chrome.runtime.sendMessage({ directions });
});
