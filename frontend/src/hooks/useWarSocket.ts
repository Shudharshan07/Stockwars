import { useEffect, useState } from "react";
import type { Trade, LeaderboardEntry, WSMessage } from "../api/types";
import { WS_BASE_URL } from "../api/config";


export const useWarSocket = (warCode: string) => {
    const [trades, setTrades] = useState<Trade[]>([]);
    const [users, setUsers] = useState<LeaderboardEntry[]>([]);

    useEffect(() => {
        if (!warCode) return;

        const token = localStorage.getItem('auth_token');
        const socketUrl = `${WS_BASE_URL}/ws?warCode=${warCode}&token=${token}`;

        console.log('Connecting to WebSocket:', socketUrl);
        const ws = new WebSocket(socketUrl);

        ws.onopen = () => {
            console.log('Connected to Stock Wars Engine');
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data) as WSMessage;

                switch (message.type) {
                    case "TRADE":
                        setTrades((prev) => [message.data, ...prev].slice(0, 50));
                        break;
                    case "INITIAL_USERS":
                    case "LEADERBOARD_UPDATE":
                        setUsers(message.data);
                        break;
                    case "USER_JOINED":
                        // We could handle single joins if we want, but for now we'll rely on full updates
                        break;
                }
            } catch (err) {
                console.error('Failed to parse socket message:', err);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log("Disconnected from Stock Wars Engine");
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [warCode]);

    return { trades, users };
}