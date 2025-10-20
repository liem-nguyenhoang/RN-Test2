import { create } from 'zustand';

type DoorControlState = {
  activeAction: 'open' | 'close' | null;
  showActionModal: 'open' | 'close' | null;
  setActiveAction: (action: 'open' | 'close' | null) => void;
  setShowActionModal: (isShow: 'open' | 'close' | null) => void;
};

export const useDoorControlStore = create<DoorControlState>(set => ({
  activeAction: null,
  showActionModal: null,
  setActiveAction: action => set({ activeAction: action }),
  setShowActionModal: isShow => set({ showActionModal: isShow }),
}));
