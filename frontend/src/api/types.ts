import type { components } from "./schema";


export type Users = components["schemas"]["User"];
export type RegisterRequest = components["schemas"]["RegisterRequest"];
export type LoginRequest = components["schemas"]["LoginRequest"];
export type LoginResponse = components["schemas"]["LoginResponse"];

export type Wars = components["schemas"]["Wars"];
export type WarConfig = components["schemas"]["WarConfig"];


export const OrderType = {
  Buy: 0,
  Sell: 1,
} as const;

export type OrderType = (typeof OrderType)[keyof typeof OrderType];


export interface Order {
  player_id: string
  type: OrderType
  quantity: number
  price: number
  timestamp: Date
}

export interface Trade {
  buyer_id: string
  seller_id: string
  quantity: number
  price: number
}

export interface LeaderboardEntry {
  username: string;
  wealth: number;
}

export interface WSMessage {
  type: "TRADE" | "INITIAL_USERS" | "USER_JOINED" | "LEADERBOARD_UPDATE";
  data: any;
}