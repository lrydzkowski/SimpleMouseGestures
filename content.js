const gesturesHandler = new GesturesHandler();
gesturesHandler.registerEvent();
const canvasBuilder = new CanvasBuilder();
const canvas = canvasBuilder.build();
const canvasEventHandler = new CanvasEventHandler(canvas);
canvasEventHandler.registerEvent();
const canvasHandler = new CanvasHandler(canvasEventHandler, canvas);
const contentEventHandler = new ContentEventHandler(gesturesHandler, canvasHandler);
contentEventHandler.registerEvents();
