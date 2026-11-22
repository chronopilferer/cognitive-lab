import type { Card } from "../../infrastructure/storage/schema";
import type { Config } from "./types";
import { localDay } from "../../shared/utils";

export const DEFAULT_DECK = "기본 묶음";
export const deckName = (card: { deck?: string }) =>
  card.deck?.trim() || DEFAULT_DECK;
export function deckNames(cards: Card[]) {
  return [...new Set([DEFAULT_DECK, ...cards.map(deckName)])].sort((a, b) =>
    a.localeCompare(b, "ko"),
  );
}
export function cardsInDeck(cards: Card[], deck?: string) {
  return deck ? cards.filter((card) => deckName(card) === deck) : cards;
}
export function reviewCards(cards: Card[], config: Config, today = localDay()) {
  return cardsInDeck(cards, config.deck)
    .filter(
      (card) =>
        (!card.status || card.status === "active") &&
        (!card.type ||
          ["memorization", "explanation", "application", "speaking"].includes(
            card.type,
          )) &&
        (card.contentVersion ?? 1) === 1,
    )
    .filter((card) => config.mode === "practice" || card.due <= today)
    .sort(
      (a, b) =>
        a.due.localeCompare(b.due) || a.updatedAt.localeCompare(b.updatedAt),
    )
    .slice(0, config.rounds);
}
