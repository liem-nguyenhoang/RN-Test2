import { create } from 'zustand';

type AppContextState = {
  userId?: string;
  deviceName?: string;
  setUserId: (id: string) => void;
  setDeviceName: (id: string) => void;
};

export const useAppContextStore = create<AppContextState>(set => ({
  userId: 'userId',
  deviceName: 'UnknownDevice',
  setUserId: userId => set({ userId }),
  setDeviceName: deviceName => set({ deviceName }),
}));
