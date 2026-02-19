import React, { useState, useEffect } from 'react';
import { AppView, ChessMove, GameMetadata } from './types';
import { parseScoresheet } from './services/geminiService';
import { generatePGN } from './utils/pgnUtils';
import MoveEditor from './components/MoveEditor';
import CameraCapture from './components/CameraCapture';

const INITIAL_METADATA: GameMetadata = {
  event: 'Casual Game',
  site: '',
  date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
  round: '1',
  white: '',
  black: '',
  result: '*',
};

const ScanningView: React.FC = () => {
  const [msgIdx, setMsgIdx] = useState(0);
  const messages = ["Analyzing Image", "Reading Handwriting", "Verifying Notation", "Finalizing Moves"];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx(prev => (prev + 1) % messages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 safe-top safe-bottom bg-white">
      <div className="relative mb-10">
        <div className="w-24 h-24 border-4 border-emerald-100 rounded-full"></div>
        <div className="w-24 h-24 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
      </div>
      <h2 className="text-2xl font-black text-slate-800 mb-2 text-center">Processing Scoresheet</h2>
      <p className="text-slate-400 font-semibold animate-pulse">{messages[msgIdx]}</p>
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('home');
  const [moves, setMoves] = useState<ChessMove[]>([]);
  const [metadata, setMetadata] = useState<GameMetadata>(INITIAL_METADATA);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isApiKeyMissing = !process.env.API_KEY || process.env.API_KEY === "";

  const processImage = async (base64: string) => {
    setIsProcessing(true);
    setView('scanning');
    setError(null);

    try {
      const result = await parseScoresheet(base64);
      setMoves(result.moves || []);
      setMetadata(prev => ({
        ...prev,
        ...result.metadata,
        white: result.metadata.white || prev.white || '',
        black: result.metadata.black || prev.black || '',
        event: result.metadata.event || prev.event || 'Casual Game',
      }));
      setView('editing');
    } catch (err: any) {
      console.error("OCR Processing Error:", err);
      setError(err.message || 'Failed to scan scoresheet. Please ensure the image is clear.');
      setView('home');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        const base64 = result.split(',')[1];
        if (base64) {
          processImage(base64);
        } else {
          setError("Failed to process the uploaded image format.");
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    const pgn = generatePGN(metadata, moves);
    const safeName = (metadata.white || 'Game').replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'chess_game';
    const blob = new Blob([pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeName}.pgn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleWhatsAppDirect = () => {
    const pgn = generatePGN(metadata, moves);
    const whiteName = metadata.white || 'White';
    const blackName = metadata.black || 'Black';
    
    try {
      navigator.clipboard.writeText(pgn);
    } catch (e) {}

    const waText = `*Chess Game PGN:* ${whiteName} vs ${blackName}\n\n${pgn}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(waText)}`;
    window.open(waUrl, '_blank');
  };

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center safe-top safe-bottom bg-gray-50">
      <div className="w-24 h-24 bg-emerald-600 rounded-3xl flex items-center justify-center shadow-lg mb-8">
        <i className="fa-solid fa-chess-knight text-white text-5xl"></i>
      </div>
      <h1 className="text-4xl font-black text-gray-800 mb-2 font-serif">ClickChess</h1>
      <p className="text-gray-500 mb-12 max-w-xs font-medium">Scan your scoresheets to PGN in seconds.</p>
      
      {isApiKeyMissing && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm font-semibold">
          <i className="fa-solid fa-triangle-exclamation mr-2"></i>
          API Key not detected. Please add it to Vercel Environment Variables.
        </div>
      )}

      <div className="w-full max-w-sm space-y-4">
        <button 
          onClick={() => setView('camera')}
          disabled={isApiKeyMissing}
          className={`w-full ${isApiKeyMissing ? 'bg-gray-300' : 'bg-emerald-600 hover:bg-emerald-700'} text-white font-bold py-5 px-8 rounded-2xl shadow-xl transition-all flex items-center justify-center transform active:scale-95`}
        >
          <i className="fa-solid fa-camera mr-3 text-2xl"></i>
          Open Scanner
        </button>

        <label className={`w-full bg-white border-2 ${isApiKeyMissing ? 'border-gray-200 text-gray-300' : 'border-emerald-100 text-emerald-700'} font-bold py-4 rounded-2xl flex items-center justify-center cursor-pointer active:bg-emerald-50 transition-colors`}>
          <i className="fa-solid fa-image mr-3"></i>
          Pick from Gallery
          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isApiKeyMissing} />
        </label>
      </div>
      
      {error && (
        <div className="mt-6 px-6 py-3 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-sm font-bold shadow-sm">
          {error}
        </div>
      )}
    </div>
  );

  // ... (rest of the component remains the same)
  return (
    <main className="min-h-screen">
      {view === 'home' && renderHome()}
      {/* ... other views ... */}
    </main>
  );
};

export default App;
