import { Search, Loader2, Columns3, Download } from 'lucide-react';
import type { ModuleConfig } from '../types/module';

interface SearchHeaderProps {
  moduleConfig: ModuleConfig;
  query: string;
  onSearchChange: (value: string) => void;
  loading: boolean;
  resultCount: number;
  columnPanelOpen: boolean;
  onToggleColumnPanel: () => void;
  onExport: () => void;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  moduleConfig,
  query,
  onSearchChange,
  loading,
  resultCount,
  columnPanelOpen,
  onToggleColumnPanel,
  onExport,
}) => {
  const Icon = moduleConfig.icon;

  return (
    <header className="h-11 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 z-30">
      <div className="flex items-center gap-2.5">
        <div className="bg-blue-600 p-1.5 rounded-lg text-white">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="flex items-baseline gap-2">
          <h1 className="text-sm font-[900] text-slate-800 leading-none tracking-tight uppercase">{moduleConfig.id.toUpperCase()}</h1>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{moduleConfig.subtitle}</p>
        </div>
      </div>

      <div className="relative flex-1 max-w-xl mx-6">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
          {loading ? <Loader2 className="h-3.5 w-3.5 text-blue-600 animate-spin" /> : <Search className="h-3.5 w-3.5 text-slate-400" />}
        </div>
        <input
          type="text"
          className="block w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 border-solid rounded-md text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-colors text-slate-700"
          placeholder={moduleConfig.searchPlaceholder}
          value={query}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleColumnPanel}
          className={`p-1.5 rounded-md transition-colors ${columnPanelOpen ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
          title="Columnas visibles"
        >
          <Columns3 className="w-4 h-4" />
        </button>
        <button
          onClick={onExport}
          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          title="Exportar a CSV"
        >
          <Download className="w-4 h-4" />
        </button>
        <div className="h-5 w-px bg-slate-200 mx-0.5"></div>
        <span className="text-xs text-slate-500 tabular-nums font-medium">{resultCount} resultados</span>
      </div>
    </header>
  );
};
