import { describe, expect, it } from 'vitest';
import { GesturesHandler } from '../../src/content-scripts/gestures-handler';

const rightButtonHeld = 2;

function createHandlerAt(x: number, y: number) {
  const handler = new GesturesHandler();
  handler.initPosition(new MouseEvent('mousedown', { clientX: x, clientY: y }));

  return handler;
}

function moveTo(x: number, y: number, buttons: number = rightButtonHeld) {
  window.dispatchEvent(new MouseEvent('mousemove', { clientX: x, clientY: y, buttons }));
}

describe('GesturesHandler', () => {
  it('records up for movement towards the top of the screen', () => {
    const handler = createHandlerAt(100, 100);
    moveTo(100, 50);

    expect(handler.getGestures()).toEqual(['up']);
  });

  it('records right for movement towards the right edge', () => {
    const handler = createHandlerAt(100, 100);
    moveTo(150, 100);

    expect(handler.getGestures()).toEqual(['right']);
  });

  it('records down for movement towards the bottom of the screen', () => {
    const handler = createHandlerAt(100, 100);
    moveTo(100, 150);

    expect(handler.getGestures()).toEqual(['down']);
  });

  it('records left for movement towards the left edge', () => {
    const handler = createHandlerAt(100, 100);
    moveTo(50, 100);

    expect(handler.getGestures()).toEqual(['left']);
  });

  it('records up at the 45 degree boundary (diagonal up-left)', () => {
    const handler = createHandlerAt(100, 100);
    moveTo(50, 50);

    expect(handler.getGestures()).toEqual(['up']);
  });

  it('records right at the 135 degree boundary (diagonal up-right)', () => {
    const handler = createHandlerAt(100, 100);
    moveTo(150, 50);

    expect(handler.getGestures()).toEqual(['right']);
  });

  it('records down at the 225 degree boundary (diagonal down-right)', () => {
    const handler = createHandlerAt(100, 100);
    moveTo(150, 150);

    expect(handler.getGestures()).toEqual(['down']);
  });

  it('records left at the 315 degree boundary (diagonal down-left)', () => {
    const handler = createHandlerAt(100, 100);
    moveTo(50, 150);

    expect(handler.getGestures()).toEqual(['left']);
  });

  it('collapses consecutive movements in the same direction into one token', () => {
    const handler = createHandlerAt(100, 100);
    moveTo(150, 100);
    moveTo(200, 100);
    moveTo(250, 100);

    expect(handler.getGestures()).toEqual(['right']);
  });

  it('records a sequence of distinct directions', () => {
    const handler = createHandlerAt(100, 100);
    moveTo(150, 100);
    moveTo(150, 150);
    moveTo(100, 150);

    expect(handler.getGestures()).toEqual(['right', 'down', 'left']);
  });

  it('repeats a direction when separated by another direction', () => {
    const handler = createHandlerAt(100, 100);
    moveTo(150, 100);
    moveTo(150, 150);
    moveTo(200, 150);

    expect(handler.getGestures()).toEqual(['right', 'down', 'right']);
  });

  it('ignores movements of 3px or less on both axes', () => {
    const handler = createHandlerAt(100, 100);
    moveTo(103, 103);
    moveTo(101, 98);

    expect(handler.getGestures()).toEqual([]);
  });

  it('records movement of more than 3px on a single axis', () => {
    const handler = createHandlerAt(100, 100);
    moveTo(104, 100);

    expect(handler.getGestures()).toEqual(['right']);
  });

  it('ignores movements without the right button held', () => {
    const handler = createHandlerAt(100, 100);
    moveTo(150, 100, 0);
    moveTo(100, 150, 1);

    expect(handler.getGestures()).toEqual([]);
  });

  it('stops recording after getGestures unregisters the listener', () => {
    const handler = createHandlerAt(100, 100);
    moveTo(150, 100);
    handler.getGestures();
    moveTo(150, 150);

    expect(handler.getGestures()).toEqual(['right']);
  });

  it('resets recorded gestures when the position is initialized again', () => {
    const handler = createHandlerAt(100, 100);
    moveTo(150, 100);
    handler.initPosition(new MouseEvent('mousedown', { clientX: 100, clientY: 100 }));
    moveTo(100, 150);

    expect(handler.getGestures()).toEqual(['down']);
  });

  it('clears gestures and stops recording on cancel', () => {
    const handler = createHandlerAt(100, 100);
    moveTo(150, 100);
    handler.cancel();
    moveTo(150, 150);

    expect(handler.getGestures()).toEqual([]);
  });

  it('notifies the start recording handler once per gesture', () => {
    const handler = createHandlerAt(100, 100);
    let startCount = 0;
    handler.addStartRecordingGestureEventHandler(() => {
      startCount++;
    });
    moveTo(150, 100);
    moveTo(200, 100);
    moveTo(200, 150);

    expect(startCount).toBe(1);
  });
});
