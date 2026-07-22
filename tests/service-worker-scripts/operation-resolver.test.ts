import { describe, expect, it, vi } from 'vitest';
import { OperationResolver } from '../../src/service-worker-scripts/operation-resolver';
import { Context } from '../../src/service-worker-scripts/context';
import { Storage } from '../../src/service-worker-scripts/storage';

function createStorageStub(map: Record<string, string>) {
  return {
    getOperationKey: (gestures: string) => map[gestures],
  } as unknown as Storage;
}

describe('OperationResolver', () => {
  it('executes the operation mapped to the gesture sequence', async () => {
    const storage = createStorageStub({ 'up|left': 'goBack' });
    const resolver = new OperationResolver(storage);
    const doAsyncSpy = vi
      .spyOn(OperationResolver.operations['goBack'].operation, 'doAsync')
      .mockResolvedValue(undefined);
    const context = new Context(['up', 'left'], '', '');

    await resolver.resolveAsync(context);

    expect(doAsyncSpy).toHaveBeenCalledExactlyOnceWith(context);
    doAsyncSpy.mockRestore();
  });

  it('does nothing for a gesture sequence without a mapping', async () => {
    const storage = createStorageStub({});
    const resolver = new OperationResolver(storage);
    const doAsyncSpy = vi
      .spyOn(OperationResolver.operations['goBack'].operation, 'doAsync')
      .mockResolvedValue(undefined);
    const context = new Context(['down', 'right'], '', '');

    await expect(resolver.resolveAsync(context)).resolves.toBeUndefined();

    expect(doAsyncSpy).not.toHaveBeenCalled();
    doAsyncSpy.mockRestore();
  });

  it('does nothing when the mapping points to an unknown operation', async () => {
    const storage = createStorageStub({ up: 'nonExistingOperation' });
    const resolver = new OperationResolver(storage);
    const context = new Context(['up'], '', '');

    await expect(resolver.resolveAsync(context)).resolves.toBeUndefined();
  });

  it('exposes a label for every registered operation', () => {
    for (const operationKey in OperationResolver.operations) {
      expect(OperationResolver.operations[operationKey].label).toBeTruthy();
    }
  });
});
