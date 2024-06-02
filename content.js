const gesturesHandler = new GesturesHandler();
const canvasBuilder = new CanvasBuilder();
const canvas = canvasBuilder.build();
const storage = new SettingsStorage();
const canvasEventHandler = new CanvasEventHandler(canvas, storage);
canvasEventHandler.registerEvent();
const canvasHandler = new CanvasHandler(canvasEventHandler, canvas);
const contentEventHandler = new ContentEventHandler(gesturesHandler, canvasHandler);
contentEventHandler.registerEvents();
