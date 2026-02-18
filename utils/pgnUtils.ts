
import { ChessMove, GameMetadata } from "../types";

export const generatePGN = (metadata: GameMetadata, moves: ChessMove[]): string => {
  const tags = [
    `[Event "${metadata.event || 'ClickChess Game'}"]`,
    `[Site "${metadata.site || '?'}"]`,
    `[Date "${metadata.date || '????.??.??'}"]`,
    `[Round "${metadata.round || '1'}"]`,
    `[White "${metadata.white || 'White'}"]`,
    `[Black "${metadata.black || 'Black'}"]`,
    `[Result "${metadata.result || '*'}"]`,
  ].join('\n');

  // Format moves: 1. e4 e5 2. Nf3 ...
  const moveString = moves
    .map(m => {
      let s = `${m.moveNumber}. ${m.white || '...'}`;
      if (m.black) s += ` ${m.black}`;
      return s;
    })
    .join(' ');

  // Standard PGN requires a blank line between tags and moves
  return `${tags}\n\n${moveString} ${metadata.result || '*'}`;
};
