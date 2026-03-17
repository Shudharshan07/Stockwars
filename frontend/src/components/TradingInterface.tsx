import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';

// import { TrendingUp, TrendingDown, DollarSign, Shield } from 'lucide-react';
import { useWarSocket } from '../hooks/useWarSocket';
import type { Wars } from '../api/types';

interface TradingInterfaceProps {
  warData: Wars;
  username?: string;
  onLogout?: () => void;
}

export function TradingInterface({ warData, username = 'UNAME', onLogout }: TradingInterfaceProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  const { trades, users } = useWarSocket(warData.warCode || '');

  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState(1);
  const [currentPrice, setCurrentPrice] = useState(150.00);
  const [balance, setBalance] = useState(warData.config?.initialBalance || 999);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#09090b' }, // Matches zinc-950
        textColor: '#a1a1aa',
      },
      grid: {
        vertLines: { color: '#18181b' },
        horzLines: { color: '#18181b' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    const initialData = generateMockCandlestickData();
    candlestickSeries.setData(initialData);

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        candlestickSeriesRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (trades.length > 0 && candlestickSeriesRef.current) {
      const latestTrade = trades[0];
      if (latestTrade.price) {
        setCurrentPrice(latestTrade.price);
      }
    }
  }, [trades]);

  const handleTrade = () => {
    const totalCost = currentPrice * quantity;
    if (orderType === 'buy') {
      if (balance >= totalCost) {
        setBalance(balance - totalCost);
        setPosition(position + quantity);
      } else {
        alert('Insufficient balance!');
      }
    } else {
      if (position >= quantity) {
        setBalance(balance + totalCost);
        setPosition(position - quantity);
      } else {
        alert('Insufficient shares!');
      }
    }
  };

  const maxQuantity = orderType === 'buy'
    ? Math.max(0, Math.floor(balance / (currentPrice || 1)))
    : position;

  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] flex flex-col">
      {/* Header - No bottom margin */}
      <header className="w-full bg-[#0A0A0A] border-b border-[#0A0A0A] px-6 py-4">
        <div className="flex items-center justify-between w-3/4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">$</span>
            </div>
            <div className="text-2xl font-bold">
              <span className="text-white">STOCK </span>
              <span className="text-emerald-500">WARS</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={onLogout}
              className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-semibold transition-colors border border-zinc-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Unified Trading Area - 75% width on the left */}
      <main className="flex-1 w-3/4 border-r border-zinc-800 bg-[#0A0A0A]">

        {/* Top Bar: War Code & Stats */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0A0A0A] border-b border-zinc-800">
          <div>
            <span className="text-[#0A0A0A]-500 text-xs font-bold uppercase tracking-tighter block">War Code</span>
            <h2 className="text-2xl font-mono font-bold text-emerald-500 tracking-widest">
              {warData.warCode || 'XXXXXX'}
            </h2>
          </div>
          <div className="text-right">
            <span className="text-[#0A0A0A]-500 text-xs font-bold uppercase tracking-tighter block">Current Market Price</span>
            <p className="text-white text-2xl font-mono font-bold">${currentPrice.toFixed(2)}</p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="w-full bg-black/20">
          <div ref={chartContainerRef} className="w-full" />
        </div>

        {/* Integrated Controls Section */}
        <div className="p-6 border-t border-zinc-800 bg-zinc-900/40">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Column 1: Mode Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-zinc-500 text-xs font-bold uppercase mb-3">Order Direction</label>
                <div className="flex bg-zinc-950 p-1 rounded-xl gap-1">
                  <button
                    onClick={() => { setOrderType('buy'); setQuantity(1); }}
                    className={`flex-1 py-3 rounded-lg font-bold transition-all ${orderType === 'buy' ? 'bg-emerald-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    BUY
                  </button>
                  <button
                    onClick={() => { setOrderType('sell'); setQuantity(1); }}
                    className={`flex-1 py-3 rounded-lg font-bold transition-all ${orderType === 'sell' ? 'bg-red-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    SELL
                  </button>
                </div>
              </div>
            </div>

            {/* Column 2: Quantity & Max */}
            <div className="space-y-4">
              <label className="block text-zinc-500 text-xs font-bold uppercase mb-3">Shares to Transact</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max={maxQuantity}
                  value={quantity || ''}
                  onChange={(e) => setQuantity(Math.max(0, Math.min(maxQuantity, parseInt(e.target.value) || 0)))}
                  className="w-full pl-4 pr-20 py-3.5 bg-zinc-950 border border-zinc-800 text-white rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all font-mono text-lg"
                />
                <button
                  onClick={() => setQuantity(maxQuantity)}
                  className="absolute right-2 top-2 bottom-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold transition-colors"
                >
                  MAX
                </button>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest px-1">
                <span className="text-zinc-500">Available: {maxQuantity}</span>
                <span className="text-zinc-500">Balance: ${balance.toFixed(2)}</span>
              </div>
            </div>

            {/* Column 3: Execution */}
            <div className="flex flex-col justify-end">
              <button
                onClick={handleTrade}
                disabled={quantity === 0 || (orderType === 'buy' && balance < currentPrice * quantity) || (orderType === 'sell' && position < quantity)}
                className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-lg shadow-black/50 ${orderType === 'buy'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-[0.98]'
                  : 'bg-red-600 hover:bg-red-500 text-white active:scale-[0.98]'
                  } disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                {orderType === 'buy' ? 'Execute Long' : 'Execute Short'}
              </button>
              <div className="mt-3 flex justify-between items-center px-1">
                <span className="text-zinc-500 text-[10px] font-bold uppercase">Estimated Cost</span>
                <span className="text-white font-mono font-bold">${(currentPrice * quantity).toFixed(2)}</span>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Leaderboard Sidebar - 25% width on the right */}
      <aside className="w-1/4 min-h-screen bg-[#0A0A0A] border-l border-zinc-800 flex flex-col fixed right-0 top-0 pt-[72px]">
        <div className="p-6 border-b border-zinc-800 bg-black/20">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-zinc-100 font-bold uppercase tracking-widest text-xs">War Leaderboard</h3>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <p className="text-zinc-500 text-[10px] uppercase font-medium">Ranked by Total Wealth</p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {users.map((user, index) => (
            <div
              key={user.username}
              className={`flex items-center justify-between p-4 border-b border-zinc-800/50 hover:bg-zinc-900/40 transition-colors ${user.username === username ? 'bg-emerald-500/5' : ''
                }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                  index === 1 ? 'bg-zinc-300/20 text-zinc-300' :
                    index === 2 ? 'bg-amber-700/20 text-amber-700' :
                      'bg-zinc-800 text-zinc-500'
                  }`}>
                  {index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${user.username === username ? 'text-emerald-500' : 'text-zinc-200'}`}>
                      {user.username}
                    </span>
                    {user.username === username && (
                      <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-black rounded uppercase">You</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1 w-24 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500/50"
                        style={{ width: `${Math.min(100, (user.wealth / (warData.config?.initialBalance || 100000)) * 50)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-bold text-white">${user.wealth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">Net Worth</div>
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 px-6 text-center">
              <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                <span className="text-zinc-700 text-xl font-bold">?</span>
              </div>
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Awaiting players...</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-zinc-900/20 border-t border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <span className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">Your Position</span>
              <span className="text-2xl font-black text-white">#{users.findIndex(u => u.username === username) + 1 || '--'}</span>
            </div>
            <div className="text-right flex flex-col">
              <span className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">Return %</span>
              <span className={`text-sm font-bold ${(users.find(u => u.username === username)?.wealth || 0) >= (warData.config?.initialBalance || 100000)
                ? 'text-emerald-500' : 'text-red-500'
                }`}>
                {(((users.find(u => u.username === username)?.wealth || 100000) / (warData.config?.initialBalance || 100000) - 1) * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function generateMockCandlestickData(): CandlestickData[] {
  const data: CandlestickData[] = [];
  let basePrice = 150;
  const now = Math.floor(Date.now() / 1000);
  for (let i = 100; i >= 0; i--) {
    const time = now - (i * 60);
    const open = basePrice + (Math.random() - 0.5) * 2;
    const close = open + (Math.random() - 0.5) * 3;
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;
    data.push({
      time: time as Time,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
    });
    basePrice = close;
  }
  return data;
}