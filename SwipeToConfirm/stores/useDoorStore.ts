import { create } from 'zustand';

export type DoorType = 'door' | 'shutter';

interface DoorInfo {
  type: DoorType | null;
  deviceId: string | null;
  fittingId: string | null;
  fittingName: string | null;
  timeLog: string | null; // ISO format: new Date().toISOString()
}

interface DoorStore extends DoorInfo {
  setDoorInfo: (info: Partial<DoorInfo>) => void;
  resetDoorInfo: () => void;
}

export const useDoorStore = create<DoorStore>(set => ({
  type: null,
  deviceId: null,
  fittingId: null,
  fittingName: null,
  timeLog: null,

  setDoorInfo: info =>
    set(state => ({
      ...state,
      ...info,
    })),

  resetDoorInfo: () =>
    set({
      type: null,
      deviceId: null,
      fittingId: null,
      fittingName: null,
      timeLog: null,
    }),
}));
