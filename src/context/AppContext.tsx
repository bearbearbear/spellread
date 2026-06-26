
import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from "react";
import type { AppState, DeviceState, UserProfile } from "@/types";
import {
  deviceToAppState,
  loadDeviceState,
  mergeAppStateIntoDevice,
  saveDeviceState,
  switchActiveUser,
  registerUser,
  deleteUser,
  listUsers,
  userCount,
} from "@/lib/device-store";
import { updateStreak } from "@/lib/store";

interface AppContextValue {
  state: AppState;
  setState: (updater: (prev: AppState) => AppState) => void;
  isReady: boolean;
  device: DeviceState;
  learners: UserProfile[];
  switchUser: (userId: string) => void;
  addLearner: (
    profile: UserProfile,
    placement: { lexile: number; startChapter: number },
  ) => void;
  removeLearner: (userId: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [device, setDevice] = useState<DeviceState>(() => loadDeviceState());
  const [isReady, setIsReady] = useState(false);

  const state = useMemo(() => deviceToAppState(device), [device]);
  const learners = useMemo(() => listUsers(device), [device]);

  useEffect(() => {
    let loaded = loadDeviceState();
    loaded = mergeAppStateIntoDevice(loaded, updateStreak(deviceToAppState(loaded)));
    setDevice(loaded);
    saveDeviceState(loaded);
    setIsReady(true);
  }, []);

  const setState = useCallback(
    (updater: (prev: AppState) => AppState) => {
      setDevice((prevDevice) => {
        const prevApp = deviceToAppState(prevDevice);
        const nextApp = updater(prevApp);
        const nextDevice = mergeAppStateIntoDevice(prevDevice, nextApp);
        saveDeviceState(nextDevice);
        return nextDevice;
      });
    },
    [],
  );

  const addLearner = useCallback(
    (profile: UserProfile, placement: { lexile: number; startChapter: number }) => {
      setDevice((prev) => {
        const next = registerUser(prev, profile, placement);
        saveDeviceState(next);
        return next;
      });
    },
    [],
  );

  const switchUser = useCallback((userId: string) => {
    setDevice((prev) => {
      const next = switchActiveUser(prev, userId);
      saveDeviceState(next);
      return next;
    });
  }, []);

  const removeLearner = useCallback((userId: string) => {
    setDevice((prev) => {
      const next = deleteUser(prev, userId);
      saveDeviceState(next);
      return next;
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        setState,
        isReady,
        device,
        learners,
        switchUser,
        addLearner,
        removeLearner,
      }}
    >
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

export function useLearnerCount(): number {
  const { device } = useApp();
  return userCount(device);
}
