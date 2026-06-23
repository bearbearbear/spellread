
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { AppState, UserProfile } from "@/types";
import {
  loadState,
  saveState,
  getDefaultState,
  updateStreak,
} from "@/lib/store";

interface AppContextValue {
  state: AppState;
  setState: (updater: (prev: AppState) => AppState) => void;
  isReady: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setStateInternal] = useState<AppState>(getDefaultState);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loaded = loadState();
    const withStreak = updateStreak(loaded);
    setStateInternal(withStreak);
    saveState(withStreak);
    setIsReady(true);
  }, []);

  const setState = useCallback((updater: (prev: AppState) => AppState) => {
    setStateInternal((prev) => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  return (
    <AppContext.Provider value={{ state, setState, isReady }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function useProfile(): UserProfile | null {
  return useApp().state.profile;
}
