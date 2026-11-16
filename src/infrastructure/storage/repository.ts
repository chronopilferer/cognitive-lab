import { supabase } from "../cloud/client";
import {
  emptyData,
  migrate,
  validateData,
  type Data,
  type Card,
} from "./schema";
import { uniqueDrafts, type CardDraft } from "../../core/training/cardImport";
import { localDay, uniqueId } from "../../shared/utils";
import type { Session, Config } from "../../core/training/types";
export interface Repository {
  read(): Promise<Data>;
  saveSession(s: Session): Promise<Data>;
  saveConfig(id: string, c: Config): Promise<Data>;
  saveCard(c: Card, expectedUpdatedAt?: string): Promise<Data>;
  addCards(cards: CardDraft[]): Promise<Data>;
  deleteCard(id: string): Promise<Data>;
  deleteSession(id: string): Promise<Data>;
  setTheme(theme: "light" | "dark"): Promise<Data>;
  exportData(): Promise<string>;
  importData(data: Data, mode: "merge" | "replace"): Promise<Data>;
  clear(): Promise<Data>;
}
const KEY = "cognitive-lab:v1";
export function mergeData(old: Data, incoming: Data): Data {
  const sessions = new Map(old.sessions.map((s) => [s.id, s]));
  for (const s of incoming.sessions) {
    const existing = sessions.get(s.id);
    if (existing && JSON.stringify(existing) !== JSON.stringify(s))
      throw Error(
        "같은 ID의 서로 다른 기록이 있습니다. 기존 기록을 보존했습니다.",
      );
    sessions.set(s.id, s);
  }
  const cards = new Map(old.cards.map((c) => [c.id, c]));
  for (const c of incoming.cards) {
    const previous = cards.get(c.id);
    if (!previous || previous.updatedAt < c.updatedAt) cards.set(c.id, c);
  }
  return validateData({
    ...old,
    sessions: [...sessions.values()],
    cards: [...cards.values()],
  });
}
export class LocalStorageRepository implements Repository {
  constructor(private storage: Storage = localStorage) {}
  async read() {
    return this.readLocal();
  }
  private async readLocal() {
    const raw = this.storage.getItem(KEY);
    if (!raw) return emptyData();
    try {
      return migrate(JSON.parse(raw));
    } catch {
      throw Error(
        "저장된 데이터를 읽을 수 없습니다. 원본은 보존되어 있습니다. 설정에서 원본을 백업한 후 복원해 주세요.",
      );
    }
  }
  protected async mutate(fn: (d: Data) => Data): Promise<Data> {
    const run = async () => {
      const next = validateData(fn(await this.readLocal()));
      try {
        this.storage.setItem(KEY, JSON.stringify(next));
      } catch {
        throw Error(
          "브라우저 저장 공간이 부족하거나 저장이 차단되어 있습니다. 백업 후 공간을 확보해 주세요.",
        );
      }
      window.dispatchEvent(new Event("lab-data"));
      return next;
    };
    return navigator.locks ? navigator.locks.request(KEY, run) : run();
  }
  saveSession(s: Session) {
    return this.mutate((d) => ({
      ...d,
      sessions: [...d.sessions.filter((x) => x.id !== s.id), s],
    }));
  }
  saveConfig(id: string, c: Config) {
    return this.mutate((d) => ({
      ...d,
      settings: { ...d.settings, configs: { ...d.settings.configs, [id]: c } },
    }));
  }
  saveCard(c: Card, expectedUpdatedAt?: string) {
    return this.mutate((d) => {
      if (
        expectedUpdatedAt &&
        d.cards.find((x) => x.id === c.id)?.updatedAt !== expectedUpdatedAt
      )
        throw Error(
          "다른 탭에서 카드가 변경되거나 삭제되었습니다. 설정으로 돌아가 최신 카드를 다시 선택해 주세요.",
        );
      return { ...d, cards: [...d.cards.filter((x) => x.id !== c.id), c] };
    });
  }
  addCards(drafts: CardDraft[]) {
    return this.mutate((d) => {
      const fresh = uniqueDrafts(drafts, d.cards);
      if (d.cards.length + fresh.length > 2000)
        throw Error("카드는 최대 2,000장까지 저장할 수 있습니다.");
      return {
        ...d,
        cards: [
          ...d.cards,
          ...fresh.map((c) => ({
            ...c,
            id: uniqueId(),
            due: localDay(),
            stage: 0,
            updatedAt: new Date().toISOString(),
          })),
        ],
      };
    });
  }
  deleteCard(id: string) {
    return this.mutate((d) => ({
      ...d,
      cards: d.cards.filter((c) => c.id !== id),
    }));
  }
  deleteSession(id: string) {
    return this.mutate((d) => ({
      ...d,
      sessions: d.sessions.filter((s) => s.id !== id),
    }));
  }
  setTheme(theme: "light" | "dark") {
    return this.mutate((d) => ({ ...d, settings: { ...d.settings, theme } }));
  }
  async exportData() {
    return JSON.stringify(await this.read(), null, 2);
  }
  importData(incoming: Data, mode: "merge" | "replace") {
    validateData(incoming);
    if (mode === "replace") return this.replace(incoming);
    return this.mutate((d) => mergeData(d, incoming));
  }
  protected async replace(data: Data): Promise<Data> {
    const run = async () => {
      this.storage.setItem(KEY, JSON.stringify(validateData(data)));
      window.dispatchEvent(new Event("lab-data"));
      return data;
    };
    return navigator.locks ? navigator.locks.request(KEY, run) : run();
  }
  clear() {
    return this.replace(emptyData());
  }
  rawBackup() {
    return this.storage.getItem(KEY) ?? "{}";
  }
}
export const localRepository = new LocalStorageRepository();
export class AccountRepository extends LocalStorageRepository {
  userId: string | null = null;
  private assertAccount(id: string) {
    if (this.userId !== id)
      throw Error("계정이 변경되었습니다. 다시 시도해 주세요.");
  }
  private async snapshot(id: string) {
    const { data, error } = await supabase
      .from("user_workspaces")
      .select("payload,revision")
      .eq("user_id", id)
      .maybeSingle();
    this.assertAccount(id);
    if (error)
      throw Error(
        "온라인 기록을 불러오지 못했습니다. 연결을 확인하고 다시 시도해 주세요.",
      );
    return {
      data: data ? validateData(data.payload) : emptyData(),
      revision: data?.revision ?? 0,
    };
  }
  override async read() {
    const id = this.userId;
    return id ? (await this.snapshot(id)).data : super.read();
  }
  protected override async mutate(fn: (d: Data) => Data): Promise<Data> {
    const id = this.userId;
    if (!id) return super.mutate(fn);
    for (let attempt = 0; attempt < 3; attempt++) {
      const current = await this.snapshot(id);
      const next = validateData(fn(current.data));
      this.assertAccount(id);
      const { data, error } = await supabase.rpc("save_workspace", {
        p_user: id,
        p_revision: current.revision,
        p_payload: next,
      });
      this.assertAccount(id);
      if (error)
        throw Error(
          "온라인 저장에 실패했습니다. 입력 내용을 유지한 채 연결을 확인하고 다시 시도해 주세요.",
        );
      if (data !== null) {
        window.dispatchEvent(new Event("lab-data"));
        return next;
      }
    }
    throw Error(
      "다른 기기에서 기록을 수정 중입니다. 잠시 후 다시 시도해 주세요.",
    );
  }
  protected override async replace(data: Data): Promise<Data> {
    return this.userId ? this.mutate(() => data) : super.replace(data);
  }
}
export const repository = new AccountRepository();
