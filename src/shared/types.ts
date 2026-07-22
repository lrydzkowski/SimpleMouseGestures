import { Consts } from './consts';

export type Direction = (typeof Consts.gesture)[keyof typeof Consts.gesture];

export type GestureMap = Record<string, string>;

export interface Settings {
  lineColor: string;
  lineWidth: number | string;
}

export interface GesturesMessage {
  type: typeof Consts.messageTypes.gestures;
  gestures: Direction[];
  selectedText: string;
  linkUrl: string;
}

export interface UpdateStorageMessage {
  type: typeof Consts.messageTypes.updateStorage;
}

export type Message = GesturesMessage | UpdateStorageMessage;

export interface BackupData {
  gestures: GestureMap;
  settings: Settings;
}
