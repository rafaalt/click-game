import assert from "node:assert/strict";
import test from "node:test";
import { normalizeScore, resolveClick } from "../lib/game.ts";

test("o primeiro clique nunca falha", () => {
  assert.deepEqual(resolveClick(0, 0), { outcome: "success", score: 1 });
  assert.deepEqual(resolveClick(0, 0.999999), { outcome: "success", score: 1 });
});

test("1% falha apenas abaixo de 0.01", () => {
  assert.deepEqual(resolveClick(1, 0.009999), { outcome: "failure", score: 1 });
  assert.deepEqual(resolveClick(1, 0.01), { outcome: "success", score: 2 });
});

test("99% preserva exatamente 1% de chance de sucesso", () => {
  assert.deepEqual(resolveClick(99, 0.989999), { outcome: "failure", score: 99 });
  assert.deepEqual(resolveClick(99, 0.99), { outcome: "success", score: 100 });
});

test("o clique após atingir 100 pontos sempre falha", () => {
  assert.deepEqual(resolveClick(100, 0), { outcome: "failure", score: 100 });
  assert.deepEqual(resolveClick(100, 0.999999), { outcome: "failure", score: 100 });
});

test("pontuações inválidas são normalizadas", () => {
  assert.equal(normalizeScore(-10), 0);
  assert.equal(normalizeScore(42.9), 42);
  assert.equal(normalizeScore(150), 100);
  assert.equal(normalizeScore(Number.NaN), 0);
});
