"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Button } from "@/components/ui/button";
import { MAX_SCORE, normalizeScore, resolveClick } from "@/lib/game";

const BEST_SCORE_KEY = "click-game:best-score:v1";

type GameStatus = "playing" | "game-over";

type WebMcpContext = {
  registerTool: (
    tool: {
      name: string;
      title: string;
      description: string;
      inputSchema: Record<string, unknown>;
      annotations: {
        readOnlyHint: boolean;
        untrustedContentHint: boolean;
      };
      execute: (input: unknown) => unknown;
    },
    options?: { signal?: AbortSignal },
  ) => void | Promise<void>;
};

function validateEmptyInput(input: unknown) {
  if (
    input === null ||
    typeof input !== "object" ||
    Array.isArray(input) ||
    Object.keys(input).length > 0
  ) {
    throw new Error("Esta ação não aceita parâmetros.");
  }
}

function readBestScore() {
  try {
    const storedValue = window.localStorage.getItem(BEST_SCORE_KEY);
    if (storedValue === null) return 0;

    const parsedValue = Number(storedValue);
    if (!Number.isInteger(parsedValue) || parsedValue < 0 || parsedValue > MAX_SCORE) {
      return 0;
    }

    return parsedValue;
  } catch {
    return 0;
  }
}

function saveBestScore(score: number) {
  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(score));
  } catch {
    // The game remains playable when browser storage is unavailable.
  }
}

export function ClickGame() {
  const [status, setStatus] = useState<GameStatus>("playing");
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [scoreAnimationKey, setScoreAnimationKey] = useState(0);
  const scoreRef = useRef(0);
  const bestScoreRef = useRef(0);
  const statusRef = useRef<GameStatus>("playing");
  const clickButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const storedBestScore = readBestScore();
      bestScoreRef.current = storedBestScore;
      setBestScore(storedBestScore);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const failureChance = normalizeScore(score);
  const successChance = 100 - failureChance;

  const performClick = useCallback(() => {
    if (statusRef.current !== "playing") {
      throw new Error("A rodada terminou. Reinicie o jogo para clicar novamente.");
    }

    const result = resolveClick(scoreRef.current, Math.random());

    if (result.outcome === "success") {
      scoreRef.current = result.score;
      flushSync(() => {
        setScore(result.score);
        setScoreAnimationKey((key) => key + 1);
      });
      return {
        outcome: result.outcome,
        score: result.score,
        failureChance: normalizeScore(result.score),
        successChance: 100 - normalizeScore(result.score),
        bestScore: bestScoreRef.current,
      };
    }

    const reachedNewRecord = result.score > bestScoreRef.current;
    if (reachedNewRecord) {
      bestScoreRef.current = result.score;
      setBestScore(result.score);
      saveBestScore(result.score);
    }

    statusRef.current = "game-over";
    flushSync(() => {
      setIsNewRecord(reachedNewRecord);
      setStatus("game-over");
    });

    return {
      outcome: result.outcome,
      score: result.score,
      bestScore: bestScoreRef.current,
      isNewRecord: reachedNewRecord,
    };
  }, []);

  const restartGame = useCallback(() => {
    scoreRef.current = 0;
    statusRef.current = "playing";
    flushSync(() => {
      setScore(0);
      setIsNewRecord(false);
      setStatus("playing");
    });
    window.requestAnimationFrame(() => clickButtonRef.current?.focus());
    return {
      status: "playing" as const,
      score: 0,
      failureChance: 0,
      successChance: 100,
      bestScore: bestScoreRef.current,
    };
  }, []);

  useEffect(() => {
    const webMcpDocument = document as Document & { modelContext?: WebMcpContext };
    const context = webMcpDocument.modelContext;
    if (!context?.registerTool) return;

    const lifecycle = new AbortController();
    const emptyInputSchema = {
      type: "object",
      properties: {},
      additionalProperties: false,
    };

    const registrations = [
      context.registerTool(
        {
          name: "play_click",
          title: "Clicar no botão",
          description:
            "Executa um clique na rodada atual, atualiza a pontuação visível e pode encerrar o jogo se o sorteio falhar.",
          inputSchema: emptyInputSchema,
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          execute(input) {
            validateEmptyInput(input);
            return performClick();
          },
        },
        { signal: lifecycle.signal },
      ),
      context.registerTool(
        {
          name: "restart_game",
          title: "Reiniciar o jogo",
          description:
            "Inicia uma nova rodada com zero pontos e preserva o recorde local.",
          inputSchema: emptyInputSchema,
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          execute(input) {
            validateEmptyInput(input);
            return restartGame();
          },
        },
        { signal: lifecycle.signal },
      ),
    ];

    for (const registration of registrations) {
      void Promise.resolve(registration).catch(() => undefined);
    }

    return () => lifecycle.abort();
  }, [performClick, restartGame]);

  function handleClick() {
    performClick();
  }

  return (
    <main className="game-shell">
      <header className="game-header">
        <p className="brand">Click Game</p>
        <p className="record" aria-label={`Recorde local: ${bestScore}`}>
          Recorde <strong>{bestScore}</strong>
        </p>
      </header>

      <section className="game-stage" aria-label="Área do jogo">
        {status === "playing" ? (
          <div className="play-view">
            <p className="score-label">Pontuação</p>
            <p key={scoreAnimationKey} className={`score${score > 0 ? " bump" : ""}`}>
              {score}
            </p>

            <div className="odds">
              <span>Chance de falha</span>
              <strong>{failureChance}%</strong>
            </div>
            <div
              className="risk-meter"
              role="progressbar"
              aria-label="Chance de falha"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={failureChance}
            >
              <div
                className="risk-meter-fill"
                style={{ "--risk": `${failureChance}%` } as React.CSSProperties}
              />
            </div>
            <p className="success-chance">{successChance}% de chance de sucesso</p>

            <Button
              ref={clickButtonRef}
              type="button"
              variant="destructive"
              className="click-button"
              onClick={handleClick}
              aria-label={`Clicar. ${failureChance}% de chance de falha`}
            >
              Clique
            </Button>

            <output className="sr-only" aria-live="polite" aria-atomic="true">
              Pontuação {score}. Chance de falha {failureChance}%.
            </output>
          </div>
        ) : (
          <div className="result-view" role="alert" aria-live="assertive">
            <p className="result-kicker">Fim da rodada</p>
            <h1 className="result-title">Você falhou</h1>
            <p className="final-score">
              Pontuação final
              <strong>{score}</strong>
            </p>
            {isNewRecord ? <p className="new-record">Novo recorde!</p> : null}
            <Button type="button" className="retry-button" onClick={restartGame} autoFocus>
              Tentar novamente
            </Button>
          </div>
        )}
      </section>

      <footer className="game-footer">
        <p>Cada ponto adiciona 1% à chance de falha.</p>
      </footer>
    </main>
  );
}
