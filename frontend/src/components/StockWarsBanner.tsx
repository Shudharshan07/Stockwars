import React from "react";

export function StockWarsBanner() {
  return (
    <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-t-2xl overflow-hidden border border-zinc-800 border-b-0 p-8">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 30 Q 25 20, 50 25 T 100 15' stroke='%2310b981' fill='none' stroke-width='2'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat-x",
          backgroundPosition: "center",
          backgroundSize: "200px 100px",
        }}
      />

      <div className="relative z-10">
        <div className="inline-block bg-emerald-500 text-zinc-950 text-xs font-bold px-3 py-1 rounded-full mb-3">
          LIVE FEED
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          <span className="text-zinc-100">STOCK</span>
          <span className="text-emerald-500">WARS</span>
        </h1>
      </div>
    </div>
  );
}

