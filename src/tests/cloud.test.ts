import { beforeEach, expect, it, vi } from "vitest";
import {
  AccountRepository,
  localRepository,
} from "../infrastructure/storage/repository";
import { emptyData } from "../infrastructure/storage/schema";
const mocks = vi.hoisted(() => ({ snapshot: vi.fn(), rpc: vi.fn() }));
vi.mock("../infrastructure/cloud/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: mocks.snapshot }) }),
    }),
    rpc: mocks.rpc,
  },
}));
let repo: AccountRepository;
beforeEach(() => {
  localStorage.clear();
  vi.resetAllMocks();
  repo = new AccountRepository();
  repo.userId = "account-a";
});
it("merges guest cards explicitly and leaves browser originals intact", async () => {
  await localRepository.addCards([{ question: "guest", answer: "answer" }]);
  mocks.snapshot.mockResolvedValue({ data: null, error: null });
  mocks.rpc.mockResolvedValue({ data: 1, error: null });
  const next = await repo.importData(await localRepository.read(), "merge");
  expect(next.cards).toHaveLength(1);
  expect((await localRepository.read()).cards).toHaveLength(1);
  expect(mocks.rpc.mock.calls[0][1].p_user).toBe("account-a");
});
it("retries conflicts against latest data rather than overwriting newer cards", async () => {
  const newer = emptyData();
  newer.cards = [
    {
      id: "other",
      question: "other device",
      answer: "x",
      stage: 0,
      due: "2026-11-16",
      updatedAt: "2026-11-16T00:00:00.000Z",
    },
  ];
  mocks.snapshot
    .mockResolvedValueOnce({ data: null, error: null })
    .mockResolvedValueOnce({
      data: { payload: newer, revision: 1 },
      error: null,
    });
  mocks.rpc
    .mockResolvedValueOnce({ data: null, error: null })
    .mockResolvedValueOnce({ data: 2, error: null });
  const next = await repo.addCards([{ question: "new", answer: "y" }]);
  expect(next.cards.map((c) => c.question)).toEqual(["other device", "new"]);
  expect(mocks.rpc.mock.calls[1][1].p_revision).toBe(1);
});
it("never falls back to guest storage after network failure", async () => {
  mocks.snapshot.mockResolvedValue({ data: null, error: null });
  mocks.rpc.mockResolvedValue({ data: null, error: { message: "offline" } });
  await expect(repo.addCards([{ question: "x", answer: "y" }])).rejects.toThrow(
    "온라인 저장",
  );
  expect((await localRepository.read()).cards).toHaveLength(0);
});
it("stops a pending save when the account changes", async () => {
  mocks.snapshot.mockImplementation(async () => {
    repo.userId = "account-b";
    return { data: null, error: null };
  });
  await expect(repo.addCards([{ question: "x", answer: "y" }])).rejects.toThrow(
    "계정이 변경",
  );
  expect(mocks.rpc).not.toHaveBeenCalled();
});
it("rejects stale card edits without sending a write", async () => {
  mocks.snapshot.mockResolvedValue({ data: null, error: null });
  await expect(
    repo.saveCard(
      {
        id: "gone",
        question: "x",
        answer: "y",
        stage: 0,
        due: "2026-11-16",
        updatedAt: "2026-11-16T00:00:00.000Z",
      },
      "old",
    ),
  ).rejects.toThrow("변경되거나 삭제");
  expect(mocks.rpc).not.toHaveBeenCalled();
});
