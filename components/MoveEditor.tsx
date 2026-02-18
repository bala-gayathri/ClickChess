
import React from 'react';
import { ChessMove } from '../types';

interface MoveEditorProps {
  moves: ChessMove[];
  onUpdate: (newMoves: ChessMove[]) => void;
}

const MoveEditor: React.FC<MoveEditorProps> = ({ moves, onUpdate }) => {
  const handleMoveChange = (index: number, color: 'white' | 'black', value: string) => {
    const newMoves = [...moves];
    newMoves[index] = { ...newMoves[index], [color]: value };
    onUpdate(newMoves);
  };

  const addMove = () => {
    const nextNum = moves.length > 0 ? moves[moves.length - 1].moveNumber + 1 : 1;
    onUpdate([...moves, { moveNumber: nextNum, white: '', black: '' }]);
  };

  const removeMove = (index: number) => {
    const newMoves = moves.filter((_, i) => i !== index);
    const reindexed = newMoves.map((m, i) => ({ ...m, moveNumber: i + 1 }));
    onUpdate(reindexed);
  };

  return (
    <div className="flex-1 overflow-y-auto px-1 pb-24">
      <div className="space-y-2">
        {moves.length === 0 && (
          <div className="text-center py-10 text-slate-400">
            <i className="fa-solid fa-list-ol text-3xl mb-2 block"></i>
            <p className="text-xs font-bold uppercase tracking-widest">No moves found</p>
          </div>
        )}
        {moves.map((move, index) => (
          <div key={index} className="flex items-center space-x-2 bg-white p-1.5 rounded-xl border border-slate-100 shadow-sm">
            <div className="w-8 text-center font-black text-slate-300 text-[10px]">{move.moveNumber}</div>
            
            <input
              type="text"
              className="flex-1 bg-slate-50 rounded-lg px-3 py-3 text-sm font-bold text-black outline-none border border-transparent focus:border-emerald-500 transition-all"
              value={move.white}
              onChange={(e) => handleMoveChange(index, 'white', e.target.value)}
              placeholder="White"
            />
            
            <input
              type="text"
              className="flex-1 bg-slate-50 rounded-lg px-3 py-3 text-sm font-bold text-black outline-none border border-transparent focus:border-emerald-500 transition-all"
              value={move.black}
              onChange={(e) => handleMoveChange(index, 'black', e.target.value)}
              placeholder="Black"
            />
            
            <button 
              onClick={() => removeMove(index)}
              className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors"
            >
              <i className="fa-solid fa-trash-can text-sm"></i>
            </button>
          </div>
        ))}
      </div>
      
      <button 
        onClick={addMove}
        className="mt-4 w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-white hover:text-emerald-600 hover:border-emerald-200 transition-all flex items-center justify-center"
      >
        <i className="fa-solid fa-plus mr-2"></i> Add Move
      </button>
    </div>
  );
};

export default MoveEditor;
