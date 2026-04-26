import { create } from "zustand";

interface AppStore {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  isAddingItem: boolean;
  setIsAddingItem: (value: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  selectedCategory: "All",
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  isAddingItem: false,
  setIsAddingItem: (value) => set({ isAddingItem: value }),
}));
