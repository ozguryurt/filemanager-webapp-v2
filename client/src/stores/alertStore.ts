import { create } from "zustand";

interface Alert {
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration: number;
  isVisible: boolean;
}

interface AlertStore {
  alert: Alert | null;
  timeoutId: any;
  showAlert: (type: Alert["type"], message: string, duration?: number) => void;
  hideAlert: () => void;
}

const useAlertStore = create<AlertStore>((set, get) => ({
  alert: null,
  timeoutId: null,
  
  showAlert: (type, message, duration = 3) => {
    const { timeoutId } = get();
    if (timeoutId) clearTimeout(timeoutId);

    const newTimeoutId = setTimeout(() => set({ alert: null, timeoutId: null }), duration * 1000);
    set({ alert: { type, message, duration, isVisible: true }, timeoutId: newTimeoutId });
  },
  
  hideAlert: () => {
    const { timeoutId } = get();
    if (timeoutId) clearTimeout(timeoutId);
    set({ alert: null, timeoutId: null });
  },
}));

export default useAlertStore;