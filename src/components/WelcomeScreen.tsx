import { useEffect, useCallback } from 'react';
import { FileText, Play } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter') onStart();
  }, [onStart]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#f8fafc] font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg shadow-blue-500/20">
          <FileText className="w-10 h-10" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-[900] text-slate-800 tracking-tight uppercase">GCZ Data</h1>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Buscador</p>
        </div>
        <p className="text-xs text-slate-400 mt-2">Consulta de datos en tiempo real</p>
        <button
          onClick={onStart}
          className="mt-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-wide shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Play className="w-4 h-4" />
          Iniciar
        </button>
        <p className="text-[10px] text-slate-300 mt-2">o presiona <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded text-[10px] font-mono">Enter</kbd></p>
      </div>
      <footer className="absolute bottom-4 text-[9px] text-slate-300 font-medium">
        © 2026 RTL - hola@raultrujillo.com
      </footer>
    </div>
  );
};
