import type {
  AppState,
  Badge,
  ChapterProgress,
  DeviceState,
  UserProfile,
  UserSave,
} from "@/types";
import { DEVICE_SCHEMA_VERSION } from "@/types";
import { chapterKey } from "./content";
import { defaultProgress, DEFAULT_BADGES } from "./store";

const STORAGE_KEY_V2 = "spellread-v2";
const STORAGE_KEY_V1 = "spellread-state";
const STORAGE_KEY_V1_BACKUP = "spellread-state-migrated";

function nowIso(): string {
  return new Date().toISOString();
}

function cloneBadges(): Badge[] {
  return DEFAULT_BADGES.map((b) => ({ ...b }));
}

function quizResultFromAttempts(progress: ChapterProgress) {
  if (progress.status !== "completed") return undefined;
  const lastPassed = [...progress.quizAttempts].reverse().find((a) => a.passed);
  if (!lastPassed) return undefined;
  return {
    score: lastPassed.score,
    passed: lastPassed.passed,
    comprehensionCorrect: lastPassed.comprehensionCorrect,
    comprehensionTotal: lastPassed.comprehensionTotal,
    vocabularyCorrect: lastPassed.vocabularyCorrect,
    vocabularyTotal: lastPassed.vocabularyTotal,
    clozeCorrect: lastPassed.clozeCorrect ?? 0,
    clozeTotal: lastPassed.clozeTotal ?? 0,
    completedAt: lastPassed.date,
  };
}

export function normalizeUserSave(save: UserSave): UserSave {
  let profile = save.profile;
  if (profile.clozeLevel === undefined) {
    profile = { ...profile, clozeLevel: 0.5 };
  }

  const chapterProgress: Record<string, ChapterProgress> = {};
  for (const [key, progress] of Object.entries(save.chapterProgress)) {
    const readingCompleted =
      progress.readingCompleted ??
      (progress.status === "quiz_pending" || progress.status === "completed");

    chapterProgress[key] = {
      ...progress,
      readingCompleted,
      lastQuizResult: progress.lastQuizResult ?? quizResultFromAttempts(progress),
      quizAttempts: progress.quizAttempts.map((a) => ({
        ...a,
        clozeCorrect: a.clozeCorrect ?? 0,
        clozeTotal: a.clozeTotal ?? 0,
      })),
    };
  }

  return {
    ...save,
    profile,
    chapterProgress,
    badges: save.badges?.length ? save.badges : cloneBadges(),
  };
}

export function createBlankUserSave(profile: UserProfile): UserSave {
  const ts = nowIso();
  return {
    profile,
    chapterProgress: { [chapterKey(1, 1)]: defaultProgress(1, 1) },
    vocabJournal: {},
    badges: cloneBadges(),
    recentQuizScores: [],
    createdAt: ts,
    updatedAt: ts,
  };
}

export function applyPlacementToUserSave(
  save: UserSave,
  lexile: number,
  startChapter: number,
): UserSave {
  const progress: Record<string, ChapterProgress> = {};
  for (let ch = 1; ch <= 17; ch++) {
    progress[chapterKey(1, ch)] = {
      ...defaultProgress(1, ch),
      status: ch < startChapter ? "completed" : ch === startChapter ? "preview_available" : "locked",
      previewCompleted: ch < startChapter,
      readingCompleted: ch < startChapter,
      completedAt: ch < startChapter ? nowIso() : undefined,
      bestScore: ch < startChapter ? 1 : undefined,
    };
  }

  return {
    ...save,
    profile: {
      ...save.profile,
      lexileEstimate: lexile,
      placementDone: true,
    },
    chapterProgress: { ...save.chapterProgress, ...progress },
    updatedAt: nowIso(),
  };
}

export function getDefaultDeviceState(): DeviceState {
  return {
    schemaVersion: DEVICE_SCHEMA_VERSION,
    activeUserId: null,
    debugMode: false,
    users: {},
    userOrder: [],
  };
}

function userSaveFromLegacyAppState(legacy: AppState): UserSave {
  const ts = nowIso();
  const profile = legacy.profile!;
  return normalizeUserSave({
    profile,
    chapterProgress: legacy.chapterProgress,
    vocabJournal: legacy.vocabJournal,
    badges: legacy.badges?.length ? legacy.badges : cloneBadges(),
    recentQuizScores: legacy.recentQuizScores ?? [],
    createdAt: ts,
    updatedAt: ts,
  });
}

function migrateFromV1(): DeviceState | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY_V1);
  if (!raw) return null;

  try {
    const legacy = JSON.parse(raw) as AppState;
    const device = getDefaultDeviceState();
    device.debugMode = legacy.debugMode ?? false;

    if (legacy.profile) {
      const save = userSaveFromLegacyAppState(legacy);
      device.users[legacy.profile.id] = save;
      device.activeUserId = legacy.profile.id;
      device.userOrder = [legacy.profile.id];
    }

    localStorage.setItem(STORAGE_KEY_V1_BACKUP, raw);
    localStorage.removeItem(STORAGE_KEY_V1);
    return device;
  } catch {
    return null;
  }
}

export function loadDeviceState(): DeviceState {
  if (typeof window === "undefined") return getDefaultDeviceState();

  try {
    const rawV2 = localStorage.getItem(STORAGE_KEY_V2);
    if (rawV2) {
      const parsed = JSON.parse(rawV2) as DeviceState;
      const device: DeviceState = {
        ...getDefaultDeviceState(),
        ...parsed,
        users: { ...parsed.users },
        userOrder: [...(parsed.userOrder ?? [])],
      };

      for (const [id, save] of Object.entries(device.users)) {
        device.users[id] = normalizeUserSave(save);
      }

      if (
        device.activeUserId &&
        !device.users[device.activeUserId]
      ) {
        device.activeUserId = device.userOrder[0] ?? null;
      }

      return device;
    }

    const migrated = migrateFromV1();
    if (migrated) {
      saveDeviceState(migrated);
      return migrated;
    }

    return getDefaultDeviceState();
  } catch {
    return getDefaultDeviceState();
  }
}

export function saveDeviceState(device: DeviceState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(device));
}

export function deviceToAppState(device: DeviceState): AppState {
  const emptyProgress = { [chapterKey(1, 1)]: defaultProgress(1, 1) };

  if (!device.activeUserId) {
    return {
      profile: null,
      chapterProgress: emptyProgress,
      vocabJournal: {},
      badges: cloneBadges(),
      recentQuizScores: [],
      debugMode: device.debugMode,
    };
  }

  const save = device.users[device.activeUserId];
  if (!save) {
    return {
      profile: null,
      chapterProgress: emptyProgress,
      vocabJournal: {},
      badges: cloneBadges(),
      recentQuizScores: [],
      debugMode: device.debugMode,
    };
  }

  const normalized = normalizeUserSave(save);
  return {
    profile: normalized.profile,
    chapterProgress: normalized.chapterProgress,
    vocabJournal: normalized.vocabJournal,
    badges: normalized.badges,
    recentQuizScores: normalized.recentQuizScores,
    debugMode: device.debugMode,
  };
}

export function mergeAppStateIntoDevice(device: DeviceState, appState: AppState): DeviceState {
  const next: DeviceState = {
    ...device,
    debugMode: appState.debugMode,
    users: { ...device.users },
  };

  if (!device.activeUserId || !appState.profile) {
    return next;
  }

  // Never write one learner's in-memory state into another learner's save slot.
  if (appState.profile.id !== device.activeUserId) {
    return next;
  }

  const existing = device.users[device.activeUserId];
  if (!existing) return next;

  next.users[device.activeUserId] = {
    ...existing,
    profile: appState.profile,
    chapterProgress: appState.chapterProgress,
    vocabJournal: appState.vocabJournal,
    badges: appState.badges,
    recentQuizScores: appState.recentQuizScores,
    updatedAt: nowIso(),
  };

  return next;
}

export function listUsers(device: DeviceState): UserProfile[] {
  const ordered = device.userOrder.filter((id) => device.users[id]);
  const rest = Object.keys(device.users).filter((id) => !ordered.includes(id));
  return [...ordered, ...rest].map((id) => device.users[id].profile);
}

export function switchActiveUser(device: DeviceState, userId: string): DeviceState {
  if (!device.users[userId]) return device;

  return {
    ...device,
    activeUserId: userId,
    userOrder: [userId, ...device.userOrder.filter((id) => id !== userId)],
  };
}

export function registerUser(
  device: DeviceState,
  profile: UserProfile,
  placement: { lexile: number; startChapter: number },
): DeviceState {
  // New learners always start blank: only Ch.1 preview_available (see MULTI_USER.md).
  // Placement sets Lexile estimate only; chapter skip is via Parent Dashboard.
  void placement.startChapter;

  const save = createBlankUserSave({
    ...profile,
    placementDone: true,
    lexileEstimate: placement.lexile,
  });

  const id = profile.id;
  return {
    ...device,
    activeUserId: id,
    users: { ...device.users, [id]: save },
    userOrder: [id, ...device.userOrder.filter((uid) => uid !== id)],
  };
}

export function deleteUser(device: DeviceState, userId: string): DeviceState {
  if (!device.users[userId]) return device;

  const users = { ...device.users };
  delete users[userId];

  const userOrder = device.userOrder.filter((id) => id !== userId);
  let activeUserId = device.activeUserId;

  if (activeUserId === userId) {
    activeUserId = userOrder[0] ?? null;
  }

  return {
    ...device,
    users,
    userOrder,
    activeUserId,
  };
}

export function userCount(device: DeviceState): number {
  return Object.keys(device.users).length;
}
