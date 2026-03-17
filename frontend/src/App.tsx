import "./App.css";
import { useState, useEffect } from "react";
import { AuthCard } from "./components/AuthCard";
import { User, LogOut } from "lucide-react";
import type { WarConfig, Wars } from "./api/types";
import { logout } from "./api";
import { createWar, joinWar } from "./api/WarService";
import { StockWarsBanner } from "./components/StockWarsBanner";
import { JoinWarPage } from "./components/JoinWarPage";
import { CreateWarPage } from "./components/CreateWarPage";
import { TradingInterface } from "./components/TradingInterface";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showJoinWar, setShowJoinWar] = useState(true);
  const [username, setUsername] = useState("DEV");
  const [currentWar, setCurrentWar] = useState<Wars | null>(null);


  const handleAuthSuccess = (userData: any) => {
    setIsLoggedIn(true);
    if (userData.username) setUsername(userData.username);
  };

  const handleJoinWar = async (warCode: string): Promise<Wars> => {
    try {
      const warData = await joinWar(warCode);
      console.log("Successfully joined war:", warData);
      setCurrentWar(warData);
      return warData;
    } catch (err: any) {
      console.error("Failed to join war:", err);
      throw err; // Re-throw to let JoinWarPage handle the error display
    }
  };

  const handleCreateWar = async (config: WarConfig) => {
    try {
      const result = await createWar(config);
      console.log("War created successfully:", result);
      setCurrentWar(result);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  useEffect(() => {
    async function initAuth() {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          // We could call a /me endpoint here to verify the token and get user data
          // For now, we'll trust the token and set the session
          // The interceptor in api.ts will handle the token refresh if needed
          setIsLoggedIn(true);
        } catch (err) {
          console.error("Session initialization failed:", err);
          localStorage.removeItem('auth_token');
        }
      }
      setIsInitializing(false);
    }

    initAuth();
  }, []);

  if (isInitializing) {
    return (
      <div className="min-h-screen w-full bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm font-medium">Initializing session...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen w-full bg-zinc-950 relative overflow-hidden">
      {/* Radial gradient in top-right corner with deep forest green at 10% opacity */}
      <div
        className="absolute top-0 right-0 w-[800px] h-[800px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(6, 78, 59, 0.1) 0%, transparent 70%)',
          transform: 'translate(30%, -30%)'
        }}
      />

      {/* Profile and Logout - Top Right (only when logged in) */}
      {isLoggedIn && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
          {/* Profile Icon with Username Tooltip */}
          <div className="relative group">
            <div className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center cursor-pointer transition-colors border border-zinc-700">
              <User className="w-5 h-5 text-emerald-500" />
            </div>
            {/* Tooltip */}
            <div className="absolute top-12 right-0 bg-zinc-800 text-white text-sm px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-zinc-700">
              {username}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              logout();
              setIsLoggedIn(false);
            }}
            className="w-10 h-10 bg-zinc-800 hover:bg-red-900/50 rounded-full flex items-center justify-center transition-colors border border-zinc-700 hover:border-red-800"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-zinc-400 hover:text-red-400" />
          </button>
        </div>
      )}

      {!isLoggedIn ? (
        <div className="w-full pt-8 pb-12 px-6">
          <div className="max-w-2xl mx-auto">
            <StockWarsBanner />

            <AuthCard onAuthSuccess={handleAuthSuccess} />

            <div className="mt-4 text-center">
              <button
                onClick={() => setIsLoggedIn(true)}
                className="text-zinc-500 text-sm hover:text-zinc-400 transition-colors"
              >
                Skip (Dev Only)
              </button>
            </div>
          </div>
        </div>
      ) : currentWar ? (
        <TradingInterface
          warData={currentWar}
          username={username}
          onLogout={() => {
            logout();
            setIsLoggedIn(false);
            setCurrentWar(null);
          }}
        />
      ) : showJoinWar ? (
        <JoinWarPage
          onCreateWar={() => setShowJoinWar(false)}
          onJoinWar={handleJoinWar}
          onSkip={() => {
            setCurrentWar({
              warId: "dev-war-id",
              warCode: "DEVMODE",
              createdAt: new Date().toISOString(),
              config: {
                initialBalance: 100000,
                priceTickMs: 1000,
                minOrderSize: 1,
                maxOrderSize: 100,
                pricePrecision: 2,
                quantityPrecision: 0,
                maxOpenOrders: 5,
              },
            } as Wars);
          }}
        />
      ) : (
        <CreateWarPage
          onBack={() => setShowJoinWar(true)}
          onCreateWar={handleCreateWar}
        />
      )}
    </div>
  );
}

export default App;
