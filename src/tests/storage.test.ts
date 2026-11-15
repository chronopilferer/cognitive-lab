import { beforeEach, describe, it, expect, vi } from "vitest";
import {
  LocalStorageRepository,
  mergeData,
} from "../infrastructure/storage/repository";
import {
  emptyData,
  migrate,
  validateData,
} from "../infrastructure/storage/schema";
import { registry } from "../core/training/registry";
import type { Session } from "../core/training/types";
const session: Session = {
  id: "one",
  trainingId: "running-span",
  startedAt: "2026-11-15T01:00:00.000Z",
  completedAt: "2026-11-15T01:01:00.000Z",
  status: "completed",
  config: registry[1].defaultConfig,
  algorithmVersion: 1,
  durationSeconds: 60,
  metrics: {
    kind: "running-span",
    correct: 8,
    total: 12,
    perfect: 2,
    rounds: 4,
  },
  inputMethod: "pointer",
};
beforeEach(() => localStorage.clear());
describe("storage contract and migrations", () => {
  it("saves idempotently and survives new repository instance", async () => {
    const r = new LocalStorageRepository();
    await r.saveSession(session);
    await r.saveSession(session);
    expect((await new LocalStorageRepository().read()).sessions).toEqual([
      session,
    ]);
  });
  it("round-trips export, merge and replacement", async () => {
    const r = new LocalStorageRepository();
    await r.saveSession(session);
    const exported = validateData(JSON.parse(await r.exportData()));
    await r.importData(exported, "merge");
    expect((await r.read()).sessions).toHaveLength(1);
    await r.importData(emptyData(), "replace");
    expect((await r.read()).sessions).toHaveLength(0);
    await r.importData(exported, "replace");
    expect((await r.read()).sessions).toEqual([session]);
  });
  it("rejects corrupt/future versions without erasing original", async () => {
    localStorage.setItem("cognitive-lab:v1", "BROKEN");
    await expect(new LocalStorageRepository().read()).rejects.toThrow();
    expect(localStorage.getItem("cognitive-lab:v1")).toBe("BROKEN");
    expect(() => migrate({ ...emptyData(), schemaVersion: 99 })).toThrow();
    expect(migrate(emptyData())).toEqual(emptyData());
  });
  it("rejects inconsistent metrics and conflicting IDs", () => {
    expect(() =>
      validateData({
        ...emptyData(),
        sessions: [
          {
            ...session,
            metrics: {
              kind: "running-span",
              correct: 100,
              total: 2,
              perfect: 0,
              rounds: 1,
            },
          },
        ],
      }),
    ).toThrow();
    const d = { ...emptyData(), sessions: [session] };
    expect(() =>
      mergeData(d, { ...d, sessions: [{ ...session, durationSeconds: 999 }] }),
    ).toThrow();
  });
  it("surfaces storage quota errors", async () => {
    const storage = {
      getItem: () => null,
      setItem: vi.fn(() => {
        throw new DOMException("Full", "QuotaExceededError");
      }),
    } as unknown as Storage;
    await expect(
      new LocalStorageRepository(storage).saveSession(session),
    ).rejects.toThrow("저장 공간");
  });
  it("separates config changes and deletions", async () => {
    const r = new LocalStorageRepository();
    await r.saveSession(session);
    await r.saveConfig("running-span", {
      ...registry[1].defaultConfig,
      level: 3,
    });
    await r.deleteSession("one");
    expect((await r.read()).settings.configs["running-span"].level).toBe(3);
    expect((await r.read()).sessions).toHaveLength(0);
  });
});
