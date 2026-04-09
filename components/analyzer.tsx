"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { toJpeg, toPng } from "html-to-image";
import clsx from "clsx";
import type { AnalysisResponse } from "@/lib/types";

const loadingMessages = [
  "looking for a ruler...",
  "zooming in...",
  "enhancing signal...",
  "checking conviction levels...",
  "running advanced analysis...",
  "measuring twice...",
  "consulting the charts...",
];

function isErrorPayload(payload: AnalysisResponse | { error?: string }): payload is { error?: string } {
  return "error" in payload;
}

function getLevelImage(level: number) {
  const safeLevel = Number.isInteger(level) ? Math.min(9, Math.max(0, level)) : 0;
  return `/levels/${safeLevel}.png`;
}

async function waitForExportAssets(element: HTMLElement) {
  const images = Array.from(element.querySelectorAll("img"));

  await Promise.all(
    images.map((image) => {
      if (image.complete && image.naturalWidth > 0) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve) => {
        const finalize = () => {
          image.removeEventListener("load", finalize);
          image.removeEventListener("error", finalize);
          resolve();
        };

        image.addEventListener("load", finalize, { once: true });
        image.addEventListener("error", finalize, { once: true });
      });
    }),
  );

  if ("fonts" in document) {
    await document.fonts.ready;
  }
}

export function Analyzer() {
  const [username, setUsername] = useState("");
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState("");
  const [shareError, setShareError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading) {
      setLoadingIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setLoadingIndex((current) => (current + 1) % loadingMessages.length);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    setAvatarLoaded(false);
    setAvatarFailed(false);
    setAvatarUrl(result?.profileImageUrl ?? null);
  }, [result?.profileImageUrl]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleaned = username.replace(/^@/, "").trim();

    if (!cleaned) {
      setError("Enter a username before we start measuring the vibes.");
      setResult(null);
      return;
    }

    setIsLoading(true);
    setError("");
    setShareError("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: cleaned }),
      });

      const payload = (await response.json()) as AnalysisResponse | { error?: string };

      if (!response.ok) {
        const message = isErrorPayload(payload)
          ? payload.error ?? "Something exploded in the sentiment chamber."
          : "Something exploded in the sentiment chamber.";

        throw new Error(message);
      }

      if (isErrorPayload(payload)) {
        throw new Error(payload.error ?? "Something exploded in the sentiment chamber.");
      }

      setResult(payload);
    } catch (submissionError) {
      setResult(null);
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Something exploded in the sentiment chamber.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleShare() {
    if (!exportRef.current) {
      return;
    }

    setIsSharing(true);
    setShareError("");

    try {
      await waitForExportAssets(exportRef.current);

      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#f6f0e4",
        skipFonts: false,
      });

      const anchor = document.createElement("a");
      anchor.href = dataUrl;
      anchor.download = "ct-cock-index.png";
      anchor.click();
    } catch (pngError) {
      console.error("PNG export failed:", pngError);

      try {
        await waitForExportAssets(exportRef.current);

        const jpegDataUrl = await toJpeg(exportRef.current, {
          cacheBust: true,
          pixelRatio: 2,
          quality: 0.95,
          backgroundColor: "#f6f0e4",
          skipFonts: false,
        });

        const anchor = document.createElement("a");
        anchor.href = jpegDataUrl;
        anchor.download = "ct-cock-index.jpg";
        anchor.click();
      } catch (jpegError) {
        console.error("JPEG export failed:", jpegError);
        setShareError("Could not generate the PNG. Try again in a second.");
      }
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl space-y-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--card)] p-6 text-center shadow-[var(--shadow)] backdrop-blur md:p-8">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[color:var(--accent)] via-[color:var(--accent-2)] to-[color:var(--accent-3)]" />
          <div className="mx-auto flex max-w-3xl flex-col items-center">
            <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
              How long is your dick? 🍆
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--muted)] sm:text-lg">
            Bullish tweets. Bigger results.
            </p>

            <form className="mt-8 flex w-full max-w-2xl flex-col items-center gap-3 sm:flex-row sm:justify-center" onSubmit={handleSubmit}>
              <label className="sr-only" htmlFor="username">
                X username
              </label>
              <div className="relative w-full sm:flex-1">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[color:var(--muted)]">
                  @
                </span>
                <input
                  id="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="elonmusk"
                  className="w-full rounded-2xl border border-[color:var(--line)] bg-white/85 px-10 py-4 text-base text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)] focus:ring-4 focus:ring-[color:var(--accent)]/15"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={clsx(
                  "w-full rounded-2xl px-6 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white transition sm:w-auto",
                  "bg-[linear-gradient(135deg,var(--accent),var(--accent-3))] shadow-lg shadow-orange-500/20",
                  "hover:scale-[1.01] hover:shadow-xl hover:shadow-orange-500/25",
                  "disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100",
                )}
              >
                {isLoading ? "Measuring..." : "Measure"}
              </button>
            </form>

            <div className="mt-4 min-h-7">
              {error ? <p className="text-sm font-medium text-[color:var(--danger)]">{error}</p> : null}
            </div>

            {isLoading ? (
              <LoadingMeter message={loadingMessages[loadingIndex]} />
            ) : (
              <div className="mt-8 grid w-full gap-3 text-sm text-[color:var(--muted)] sm:grid-cols-3">
                <div className="rounded-2xl border border-[color:var(--line)] bg-white/55 p-4 text-center">
                  Analyzes your last 20 tweets
                </div>
                <div className="rounded-2xl border border-[color:var(--line)] bg-white/55 p-4 text-center">
                  Made for fun and screenshots
                </div>
                <div className="rounded-2xl border border-[color:var(--line)] bg-white/55 p-4 text-center">
                  Powered by advanced sentiment analysis
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="relative flex justify-center">
          <div className="absolute -left-4 top-10 h-24 w-24 rounded-full bg-[color:var(--accent-2)]/35 blur-2xl" />
          <div className="absolute -right-3 bottom-10 h-28 w-28 rounded-full bg-[color:var(--accent-3)]/20 blur-2xl" />

          {result ? (
            <div className="w-full max-w-[920px] space-y-4">
              <div
                ref={exportRef}
                className="relative overflow-hidden rounded-[2rem] border border-[color:var(--line)] bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(255,241,215,0.96))] p-6 shadow-[var(--shadow)] md:p-10"
              >
                <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[color:var(--accent)] via-[color:var(--accent-2)] to-[color:var(--accent-3)]" />
                <div className="absolute right-6 top-6 flex flex-wrap justify-end gap-3 md:right-10 md:top-10">
                  <InfoPill label="Score" value={String(Math.round(result.score))} />
                  <InfoPill label="Level" value={String(result.level)} />
                </div>

                <div className="flex justify-start pr-28 sm:pr-32">
                  <div className="flex items-center justify-start gap-3 text-left">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[color:var(--line)] bg-white/80">
                      {avatarUrl && !avatarFailed ? (
                        <img
                          src={`/api/avatar?url=${encodeURIComponent(avatarUrl)}`}
                          alt={`${result.username} avatar`}
                          className={clsx(
                            "h-full w-full object-cover transition-opacity",
                            avatarLoaded ? "opacity-100" : "opacity-0",
                          )}
                          crossOrigin="anonymous"
                          onLoad={() => setAvatarLoaded(true)}
                          onError={() => setAvatarFailed(true)}
                        />
                      ) : null}
                      {avatarFailed || !avatarUrl ? (
                        <div className="flex h-full w-full items-center justify-center text-sm font-black uppercase text-[color:var(--muted)]">
                          @{result.username.slice(0, 1)}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-col items-start">
                      <p className="text-sm font-semibold tracking-tight text-[color:var(--foreground)] sm:text-base">
                        @{result.username}&apos;s dick card
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-lg font-black uppercase tracking-[0.18em] text-[color:var(--foreground)] sm:text-xl">
                    The size of your dick
                  </p>
                </div>

                <div className="mt-8 grid items-center gap-8 md:grid-cols-[420px_minmax(0,1fr)]">
                  <div className="order-1 flex justify-center md:justify-start">
                    <img
                      src={getLevelImage(result.level)}
                      alt={result.label}
                      className="h-auto w-full max-w-[380px] object-contain md:max-w-[440px]"
                    />
                  </div>

                  <div className="order-2 flex flex-col gap-5 text-center md:text-left">
                    <p className="text-6xl font-black tracking-tight text-[color:var(--accent)] sm:text-7xl">
                      {result.centimeters} cm
                    </p>
                    <div className="space-y-3">
                      <h2 className="text-4xl font-black tracking-tight text-[color:var(--foreground)] sm:text-5xl">
                        {result.label}
                      </h2>
                    </div>

                    <div className="rounded-[1.5rem] border border-[color:var(--line)] bg-white/78 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                        Comment
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[color:var(--foreground)]">{result.comment}</p>
                    </div>

                    <div className="rounded-[1.5rem] border border-[color:var(--line)] bg-white/78 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                        Confidence note
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[color:var(--foreground)]">
                        {result.confidenceNote}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-center border-t border-[color:var(--line)] pt-4">
                  <span className="text-xs font-semibold tracking-[0.16em] text-[color:var(--muted)]">
                    Built by @SherhanEth
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleShare}
                disabled={isSharing}
                className={clsx(
                  "mx-auto w-full max-w-[920px] rounded-2xl px-6 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white transition",
                  "bg-[linear-gradient(135deg,var(--accent-3),#2d5bff)] shadow-lg shadow-teal-700/20",
                  "hover:scale-[1.01] hover:shadow-xl hover:shadow-teal-700/25",
                  "disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100",
                )}
              >
                {isSharing ? "Preparing PNG..." : "Share"}
              </button>
              {shareError ? <p className="text-center text-sm font-medium text-[color:var(--danger)]">{shareError}</p> : null}
            </div>
          ) : (
            <div className="relative w-full max-w-[920px] overflow-hidden rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--card-strong)] p-6 text-center shadow-[var(--shadow)] backdrop-blur md:p-8">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[color:var(--accent)] via-[color:var(--accent-2)] to-[color:var(--accent-3)]" />
              <div className="rounded-[1.75rem] border border-dashed border-[color:var(--line)] bg-white/55 p-8 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  Screenshot-ready result
                </p>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[color:var(--muted)]">
                  Run an analysis and this space turns into a clean, shareable CT verdict with the right level art.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="mt-8 flex justify-center">
        <a
          href="https://x.com/SherhanEth"
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-full border border-[color:var(--line)] bg-white/60 px-4 py-2 text-xs font-semibold text-[color:var(--muted)] transition hover:bg-white/80 hover:text-[color:var(--foreground)]"
        >
          Built by @SherhanEth
        </a>
      </div>
    </div>
  );
}

function LoadingMeter({ message }: { message: string }) {
  return (
    <div className="mt-8 rounded-[1.75rem] border border-[color:var(--line)] bg-white/70 p-5">
      <p className="text-sm font-semibold lowercase tracking-[0.02em] text-[color:var(--foreground)]">
        {message}
      </p>
      <div className="mt-4 h-4 overflow-hidden rounded-full bg-[color:var(--line)]/70">
        <div className="loading-bar h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2),var(--accent-3))]" />
      </div>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[72px] rounded-2xl border border-[color:var(--line)] bg-white/85 px-3 py-2 text-center shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">{label}</p>
      <p className="mt-1 text-base font-black text-[color:var(--foreground)]">{value}</p>
    </div>
  );
}
