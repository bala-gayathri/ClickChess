
export interface ChessMove {
  moveNumber: number;
  white: string;
  black: string;
}

export interface GameMetadata {
  event: string;
  site: string;
  date: string;
  round: string;
  white: string;
  black: string;
  result: string;
}

export type AppView = 'home' | 'camera' | 'scanning' | 'editing' | 'preview';
