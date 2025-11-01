import { create } from 'zustand';

type ToastState = {
  visible: boolean;
  message: string;
  show: (msg: string) => void;
  hide: () => void;
};

export const useToastStore = create<ToastState>(set => ({
  visible: false,
  message: '',
  show: msg => set({ visible: true, message: msg }),
  hide: () => set({ visible: false, message: '' }),
}));
