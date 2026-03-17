import React, { useState } from "react";
import { StockWarsBanner } from "./StockWarsBanner";
import type { WarConfig } from "../api/types";

interface CreateWarPageProps {
  onBack: () => void;
  onCreateWar?: (config: WarConfig) => Promise<void> | void;
}

export function CreateWarPage({ onBack, onCreateWar }: CreateWarPageProps) {
  const [warConfig, setWarConfig] = useState<WarConfig>({
    initialBalance: 100000,
    priceTickMs: 1000,
    minOrderSize: 1,
    maxOrderSize: 1000,
    pricePrecision: 2,
    quantityPrecision: 0,
    maxOpenOrders: 10,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!warConfig.initialBalance || warConfig.initialBalance <= 0) {
      newErrors.initialBalance = "Must be positive";
    }
    if (!warConfig.minOrderSize || warConfig.minOrderSize <= 0) {
      newErrors.minOrderSize = "Must be positive";
    }
    if (!warConfig.maxOrderSize || warConfig.maxOrderSize <= 0) {
      newErrors.maxOrderSize = "Must be positive";
    }
    if (
      warConfig.minOrderSize &&
      warConfig.maxOrderSize &&
      warConfig.minOrderSize >= warConfig.maxOrderSize
    ) {
      newErrors.minOrderSize = "Must be less than max";
    }
    if (!warConfig.priceTickMs || warConfig.priceTickMs <= 0) {
      newErrors.priceTickMs = "Must be positive";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    if (!onCreateWar) {
      console.log("Creating war with config:", warConfig);
      return;
    }

    try {
      setLoading(true);
      await onCreateWar(warConfig);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full pt-8 pb-12 px-6">
      <div className="max-w-2xl mx-auto">
        <StockWarsBanner />

        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-b-lg p-8 border-t-0">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-zinc-100 mb-2">
              Create Trading War
            </h2>
            <p className="text-zinc-400 text-sm">
              Configure your trading competition settings.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wide mb-2">
                Initial Balance ($)
              </label>
              <input
                type="number"
                value={warConfig.initialBalance ?? 0}
                onChange={(e) =>
                  setWarConfig({
                    ...warConfig,
                    initialBalance: parseFloat(e.target.value) || 0,
                  })
                }
                className={`w-full px-4 py-3 bg-zinc-900 text-white rounded-md outline-none transition-all duration-200 font-medium focus:ring-1 focus:ring-emerald-500 focus:shadow-[0_0_15px_rgba(16,185,129,0.1)] ${
                  errors.initialBalance ? "ring-1 ring-red-500" : ""
                }`}
              />
              {errors.initialBalance && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.initialBalance}
                </p>
              )}
            </div>

            <div>
              <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wide mb-2">
                Price Update Frequency (ms)
              </label>
              <input
                type="number"
                value={warConfig.priceTickMs ?? 0}
                onChange={(e) =>
                  setWarConfig({
                    ...warConfig,
                    priceTickMs: parseInt(e.target.value) || 0,
                  })
                }
                className={`w-full px-4 py-3 bg-zinc-900 text-white rounded-md outline-none transition-all duration-200 font-medium focus:ring-1 focus:ring-emerald-500 focus:shadow-[0_0_15px_rgba(16,185,129,0.1)] ${
                  errors.priceTickMs ? "ring-1 ring-red-500" : ""
                }`}
              />
              {errors.priceTickMs && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.priceTickMs}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wide mb-2">
                  Min Order Size
                </label>
                <input
                  type="number"
                  value={warConfig.minOrderSize ?? 0}
                  onChange={(e) =>
                    setWarConfig({
                      ...warConfig,
                      minOrderSize: parseInt(e.target.value) || 0,
                    })
                  }
                  className={`w-full px-4 py-3 bg-zinc-900 text-white rounded-md outline-none transition-all duration-200 font-medium focus:ring-1 focus:ring-emerald-500 focus:shadow-[0_0_15px_rgba(16,185,129,0.1)] ${
                    errors.minOrderSize ? "ring-1 ring-red-500" : ""
                  }`}
                />
                {errors.minOrderSize && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.minOrderSize}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wide mb-2">
                  Max Order Size
                </label>
                <input
                  type="number"
                  value={warConfig.maxOrderSize ?? 0}
                  onChange={(e) =>
                    setWarConfig({
                      ...warConfig,
                      maxOrderSize: parseInt(e.target.value) || 0,
                    })
                  }
                  className={`w-full px-4 py-3 bg-zinc-900 text-white rounded-md outline-none transition-all duration-200 font-medium focus:ring-1 focus:ring-emerald-500 focus:shadow-[0_0_15px_rgba(16,185,129,0.1)] ${
                    errors.maxOrderSize ? "ring-1 ring-red-500" : ""
                  }`}
                />
                {errors.maxOrderSize && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.maxOrderSize}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wide mb-2">
                  Price Precision
                </label>
                <input
                  type="number"
                  value={warConfig.pricePrecision ?? 0}
                  onChange={(e) =>
                    setWarConfig({
                      ...warConfig,
                      pricePrecision: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 bg-zinc-900 text-white rounded-md outline-none transition-all duration-200 font-medium focus:ring-1 focus:ring-emerald-500 focus:shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wide mb-2">
                  Quantity Precision
                </label>
                <input
                  type="number"
                  value={warConfig.quantityPrecision ?? 0}
                  onChange={(e) =>
                    setWarConfig({
                      ...warConfig,
                      quantityPrecision: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 bg-zinc-900 text-white rounded-md outline-none transition-all duration-200 font-medium focus:ring-1 focus:ring-emerald-500 focus:shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wide mb-2">
                Max Open Orders
              </label>
              <input
                type="number"
                value={warConfig.maxOpenOrders ?? 0}
                onChange={(e) =>
                  setWarConfig({
                    ...warConfig,
                    maxOpenOrders: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-3 bg-zinc-900 text-white rounded-md outline-none transition-all duration-200 font-medium focus:ring-1 focus:ring-emerald-500 focus:shadow-[0_0_15px_rgba(16,185,129,0.1)]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm uppercase tracking-wider rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? "Creating..." : "Create War"}
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
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onBack}
              className="text-zinc-400 text-sm hover:text-zinc-300 transition-colors"
            >
              ← Back to join war
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

