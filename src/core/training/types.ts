import type { ComponentType } from "react";
export type TrainingId =
  | "nback"
  | "running-span"
  | "complex-span"
  | "reasoning"
  | "memory-palace"
  | "spaced-repetition";
export interface Config {
  level: number;
  interval: number;
  rounds: number;
  variant: string;
  mode: "practice" | "training";
  auto: boolean;
  locations: string[];
  deck?: string;
}
export type Metrics =
  | {
      kind: "nback";
      hit: number;
      miss: number;
      falseAlarm: number;
      correctRejection: number;
      reactionMs: number[];
    }
  | {
      kind: "running-span";
      correct: number;
      total: number;
      perfect: number;
      rounds: number;
    }
  | {
      kind: "complex-span";
      correct: number;
      total: number;
      mathCorrect: number;
      mathTotal: number;
    }
  | { kind: "reasoning"; correct: number; total: number; seconds: number }
  | {
      kind: "memory-palace";
      correct: number;
      total: number;
      delaySeconds: number;
    }
  | { kind: "spaced-repetition"; remembered: number; reviewed: number };
export interface Session {
  id: string;
  trainingId: TrainingId;
  startedAt: string;
  completedAt: string;
  status: "completed" | "aborted";
  config: Config;
  algorithmVersion: 1 | 2;
  durationSeconds: number;
  metrics: Metrics | null;
  inputMethod: "keyboard" | "pointer" | "mixed" | "unknown";
}
export interface GameProps {
  config: Config;
  onComplete: (metrics: Metrics) => void;
}
export interface TrainingDefinition {
  id: TrainingId;
  name: string;
  english: string;
  category: string;
  description: string;
  rule: string;
  example: string;
  accent: string;
  icon: string;
  minutes: string;
  maxLevel: number;
  defaultConfig: Config;
  variants: { value: string; label: string }[];
  component: ComponentType<GameProps>;
  metricsLabel: string;
  limitation: string;
}
