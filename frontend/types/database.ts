export interface Game {
  id: string;
  user_id: string;
  cash: number;
  current_quarter: number;
  engineers: number;
  sales_staff: number;
  [key: string]: unknown;
}

export interface GameHistory {
  id: string;
  game_id: string;
  quarter: number;
  revenue: number;
  net_income: number;
  cash: number;
  [key: string]: unknown;
}
