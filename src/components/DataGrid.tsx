import { useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { ColDef, SelectionChangedEvent } from 'ag-grid-community';

export interface DataGridHandle {
  exportCsv: () => void;
}

interface DataGridProps {
  rowData: Record<string, any>[];
  columnDefs: ColDef[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onSelectionChanged: (event: SelectionChangedEvent) => void;
}

export const DataGrid = forwardRef<DataGridHandle, DataGridProps>(({
  rowData,
  columnDefs,
  loading,
  error,
  onRetry,
  onSelectionChanged,
}, ref) => {
  const gridRef = useRef<AgGridReact>(null);

  useImperativeHandle(ref, () => ({
    exportCsv: () => {
      gridRef.current?.api?.exportDataAsCsv();
    },
  }));

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    suppressMovable: true,
    cellClass: 'text-xs',
  }), []);

  return (
    <main className="flex-1 p-2 relative flex flex-col overflow-hidden">
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 min-w-[360px] p-3 bg-white border border-solid border-rose-400 rounded-lg shadow-lg flex items-center gap-3 text-rose-600 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1 font-medium text-xs">{error}</span>
          <button onClick={onRetry} className="bg-rose-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-rose-600 transition-colors">Reintentar</button>
        </div>
      )}

      {loading && rowData.length === 0 && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/60">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="text-xs text-slate-400 font-medium">Cargando registros...</span>
          </div>
        </div>
      )}

      <div className="flex-1 ag-theme-quartz w-full rounded-lg overflow-hidden border border-solid border-slate-200 bg-white">
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={50}
          paginationPageSizeSelector={[20, 50, 100]}
          onSelectionChanged={onSelectionChanged}
          animateRows={true}
          headerHeight={34}
          rowHeight={32}
          rowSelection={{ mode: 'multiRow', checkboxes: true }}
          selectionColumnDef={{ pinned: 'left', lockPinned: true }}
          enableCellTextSelection={true}
          ensureDomOrder={true}
        />
      </div>
    </main>
  );
});
