// store.ts
import { create } from "zustand";

export type GeoState = {
  latitude: number[];
  longitude: number[];
  timestamp: number[];
  error: string[];
  addLatitude: (lat: number) => void;
  // ...定义其他状态和操作的类型
};

const useStore = create<GeoState>((set) => ({
  latitude: [],
  longitude: [],
  timestamp: [],
  error: [],
  addLatitude: (lat: number) =>
    set((state) => ({ latitude: [...state.latitude, lat] })),
  // ...定义其他状态和操作
}));

export default useStore;
