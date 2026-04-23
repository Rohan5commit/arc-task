import type { Workspace } from "@/lib/types";
import { reconcileWorkspace } from "@/lib/utils/task-helpers";

const STORAGE_KEY = "arc-task:dashboard-state:v2";

interface DashboardPersistenceState {
  workspace: Workspace;
  runtimeLabel: string;
}

export function loadDashboardState(): DashboardPersistenceState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<DashboardPersistenceState>;

    if (!parsed?.workspace || !parsed?.runtimeLabel) {
      return null;
    }

    return {
      workspace: reconcileWorkspace(parsed.workspace as Workspace),
      runtimeLabel: String(parsed.runtimeLabel)
    };
  } catch {
    return null;
  }
}

export function saveDashboardState(state: DashboardPersistenceState): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearDashboardState(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
