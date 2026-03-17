import React, { useState } from "react";
import { StockWarsBanner } from "./StockWarsBanner";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import type { Wars } from "../api/types";

interface JoinWarPageProps {
  onCreateWar: () => void;
  onJoinWar?: (warCode: string) => Promise<Wars>;
  onSkip?: () => void;
}

type JoinStatus = "idle" | "loading" | "success" | "error";

export function JoinWarPage({ onCreateWar, onJoinWar, onSkip }: JoinWarPageProps) {
  const [warCode, setWarCode] = useState("");
  const [status, setStatus] = useState<JoinStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successData, setSuccessData] = useState<any>(null);

  const handleJoinWar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = warCode.trim().toUpperCase();
    
    if (!code) {
      setErrorMessage("Please enter a war code");
      setStatus("error");
      return;
    }

    if (code.length !== 8) {
      setErrorMessage("War code must be 8 characters");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      if (onJoinWar) {
        await onJoinWar(code);
        setStatus("success");
        setSuccessData({ warCode: code });
      } else {
        console.log("Joining war:", code);
        setStatus("success");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Failed to join war. Please try again.");
    }
  };

  const resetForm = () => {
    setWarCode("");
    setStatus("idle");
    setErrorMessage("");
    setSuccessData(null);
  };

  return (
    <div className="w-full pt-8 pb-12 px-6">
      <div className="max-w-2xl mx-auto">
        <StockWarsBanner />

        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-b-lg p-8 border-t-0">
          {status === "success" ? (
            // Success State
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-zinc-100 mb-2">
                Successfully Joined!
              </h2>
              <p className="text-zinc-400 text-sm mb-6">
                You've joined the war with code: <span className="text-emerald-500 font-bold">{successData?.warCode}</span>
              </p>
              <button
                onClick={resetForm}
                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors"
              >
                Join Another War
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-zinc-100 mb-2">
                  Join Trading War
                </h2>
                <p className="text-zinc-400 text-sm">
                  Enter an 8-character war code to join the competition.
                </p>
              </div>

              <form onSubmit={handleJoinWar} className="space-y-5">
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wide mb-2">
                    War Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter war code"
                      value={warCode}
                      onChange={(e) => {
                        setWarCode(e.target.value.toUpperCase());
                        if (status === "error") {
                          setStatus("idle");
                          setErrorMessage("");
                        }
                      }}
                      disabled={status === "loading"}
                      className={`w-full px-4 py-3 bg-zinc-900 text-white text-center text-2xl font-bold tracking-widest rounded-md outline-none transition-all duration-200 uppercase focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                        status === "error"
                          ? "ring-1 ring-red-500 focus:ring-red-500"
                          : "focus:ring-emerald-500 focus:shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                      }`}
                      maxLength={8}
                    />
                  </div>
                  {status === "error" && errorMessage && (
                    <div className="mt-2 flex items-center gap-2 text-red-500 text-sm">
                      <XCircle className="w-4 h-4" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={status === "loading" || !warCode.trim()}
                  className="w-full py-3.5 px-4 bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-zinc-700 disabled:to-zinc-800 disabled:cursor-not-allowed text-white font-bold text-sm uppercase tracking-wider rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      Join War
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 flex flex-col items-center gap-4">
                <p className="text-zinc-400 text-sm">
                  Want to host?{" "}
                  <button
                    type="button"
                    onClick={onCreateWar}
                    disabled={status === "loading"}
                    className="text-emerald-500 hover:text-emerald-400 font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create a war
                  </button>
                </p>

                {import.meta.env.DEV && onSkip && (
                  <button
                    type="button"
                    onClick={onSkip}
                    disabled={status === "loading"}
                    className="text-zinc-500 text-xs hover:text-zinc-400 transition-colors uppercase tracking-widest font-medium"
                  >
                    Skip (Dev Only)
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

