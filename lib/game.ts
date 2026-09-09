export const MAX_SCORE = 100;

export type ClickResult =
  | { outcome: "success"; score: number }
  | { outcome: "failure"; score: number };

export function normalizeScore(score: number) {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(Math.trunc(score), MAX_SCORE));
}

export function resolveClick(score: number, randomValue: number): ClickResult {
  const safeScore = normalizeScore(score);
  const safeRandom = Math.max(0, Math.min(randomValue, 1 - Number.EPSILON));
  const failed = safeRandom * 100 < safeScore;

  return failed
    ? { outcome: "failure", score: safeScore }
    : { outcome: "success", score: safeScore + 1 };
}
