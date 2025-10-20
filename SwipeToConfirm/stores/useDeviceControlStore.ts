import { create } from 'zustand';

interface DeviceControlState {
  // 🔌 Power control
  isPoweredOn: boolean;
  turnOn: () => void;
  turnOff: () => void;

  // ▶️ Process control
  isRunning: boolean;

  // 🔓 Open / Close control
  isOpen: boolean;
  open: () => void;
  close: () => void;

  // ⬆️⬇️ Movement control
  position: 'up' | 'down' | null;
  moveUp: () => void;
  stop: () => void;
  moveDown: () => void;
}

export const useDeviceControlStore = create<DeviceControlState>(set => ({
  // Initial state
  isPoweredOn: false,
  isRunning: false,
  isOpen: false,
  position: null,

  // Power
  turnOn: () => set({ isPoweredOn: true }),
  turnOff: () => set({ isPoweredOn: false }),

  // Open/Close
  open: () => set(s => ({ ...s, isRunning: true, isOpen: true })),
  close: () => set(s => ({ ...s, isRunning: false, isOpen: false })),

  // Movement
  moveUp: () => set(s => ({ ...s, isRunning: true, position: 'up' })),
  stop: () => set(s => ({ ...s, isRunning: false, position: null })),
  moveDown: () => set(s => ({ ...s, isRunning: true, position: 'down' })),
}));
