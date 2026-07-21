import { Context } from './context';

export interface Operation {
  doAsync(context: Context): Promise<void>;
}
