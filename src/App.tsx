import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Search, Loader2, FileText, CheckCircle2, XCircle, AlertCircle, Clock, Download, Play, Columns3, X, Menu, ChevronLeft } from 'lucide-react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import type {
  ColDef,
  GridReadyEvent,
  ICellRendererParams,
  SelectionChangedEvent,
} from 'ag-grid-community';
import { supabase } from './supabase';
import debounce from 'lodash.debounce';

ModuleRegistry.registerModules([AllCommunityModule]);

// --- Column Visibility Preset & Persistence ---

const RECOMMENDED_COLUMNS = new Set([
  'id_registro', 'ctl_estado', 'ctl_campos_actualizados', 'ctl_fecha_evento',
  'fecha_comp', 'documento_identidad', 'proveedor', 'oc', 'tipo_documento',
  'serie', 'numero_correlativo', 'moneda', 'total_original', 'pagado_original',
  'observaciones', 'concatenar_factura', 'fd_oc_almacen', 'fd_etapa_n2_cod',
  'fd_oc_comprador', 'fd_etapa_n2', 'as_comentarios_procura',
  'as_fee_no_valorizable', 'as_bd_val_presentacion', 'pqt_colegio',
]);

const STORAGE_KEY = 'pqt06-column-visibility';

function loadVisibility(): Record<string, boolean> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveVisibility(map: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

// --- Cell Renderers ---

const DateRenderer = (params: ICellRendererParams) => {
  if (!params.value) return null;
  const date = new Date(params.value);
  if (isNaN(date.getTime())) return <span>{params.value}</span>;
  return (
    <span className="text-slate-600 text-xs">
      {date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })}
    </span>
  );
};

const AmountRenderer = (params: ICellRendererParams) => {
  if (params.value == null) return null;
  const num = Number(params.value);
  if (isNaN(num)) return <span>{params.value}</span>;
  return (
    <span className="text-slate-800 text-xs tabular-nums font-semibold">
      {num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  );
};

const StatusBadge = (params: ICellRendererParams) => {
  const status = params.value as string;
  if (!status) return null;

  const getStatusStyles = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('pagado')) return { bg: 'bg-emerald-500/10', text: 'text-emerald-700', dot: 'bg-emerald-500', icon: <CheckCircle2 className="w-3 h-3" /> };
    if (s.includes('anulado') || s.includes('cancelado')) return { bg: 'bg-rose-500/10', text: 'text-rose-700', dot: 'bg-rose-500', icon: <XCircle className="w-3 h-3" /> };
    if (s.includes('pendiente') || s.includes('proceso')) return { bg: 'bg-amber-500/10', text: 'text-amber-700', dot: 'bg-amber-500', icon: <Clock className="w-3 h-3" /> };
    return { bg: 'bg-slate-500/10', text: 'text-slate-700', dot: 'bg-slate-500', icon: <AlertCircle className="w-3 h-3" /> };
  };

  const styles = getStatusStyles(status);
  return (
    <div className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${styles.bg} ${styles.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`}></span>
      {status}
    </div>
  );
};

// --- Column Definitions (92 columns in DB order, excluding busqueda_vector) ---

const dateFields = new Set([
  'ctl_fecha_evento', 'recepcion', 'fecha_registro', 'fecha_comp', 'fecha_venc',
  'fecha_pago_real', 'as_bd_val_presentacion', 'fecha_doc_rel',
]);

const amountFields = new Set([
  'total_original', 'pagado_original', 'financiado_original', 'letras_original',
  'fondo_garantia', 'carta_fianza', 'otras_retenciones', 'total_financiado_5',
  'deducciones', 'pendiente_comp', 'pendiente_deduccion', 'pendiente_letras',
  'pend_total_soles_origen', 'pend_total_dolares',
  'soles_total', 'soles_pagado', 'soles_financiado', 'soles_letras',
  'soles_fondo_garantia', 'soles_carta_fianza', 'soles_otras_retenciones',
  'soles_total_financiado_5', 'soles_deducciones', 'soles_pendiente_comp',
  'soles_pendiente_deduccion', 'soles_pendiente_letras', 'soles_pend_total_final',
  'percepcion', 'perc_emitida', 'suma_percepcion', 'tipo_cambio',
  'total_local', 'total_extranjero',
]);

const columnConfig: { field: string; headerName: string; minWidth?: number }[] = [
  { field: 'id_registro', headerName: 'ID', minWidth: 80 },
  { field: 'ctl_estado', headerName: 'Ctl Estado', minWidth: 100 },
  { field: 'ctl_campos_actualizados', headerName: 'Ctl Campos Actualiz.', minWidth: 160 },
  { field: 'ctl_fecha_evento', headerName: 'Ctl Fecha Evento', minWidth: 120 },
  { field: 'empresa', headerName: 'Empresa', minWidth: 140 },
  { field: 'estado', headerName: 'Estado', minWidth: 120 },
  { field: 'id_estado', headerName: 'ID Estado', minWidth: 90 },
  { field: 'metodo', headerName: 'Método', minWidth: 100 },
  { field: 'recepcion', headerName: 'Recepción', minWidth: 110 },
  { field: 'fecha_registro', headerName: 'Fecha Registro', minWidth: 120 },
  { field: 'fecha_comp', headerName: 'Fecha Comp.', minWidth: 120 },
  { field: 'fecha_venc', headerName: 'Fecha Venc.', minWidth: 120 },
  { field: 'forma_pago', headerName: 'Forma Pago', minWidth: 110 },
  { field: 'dias_pendientes', headerName: 'Días Pend.', minWidth: 100 },
  { field: 'periodo', headerName: 'Periodo', minWidth: 90 },
  { field: 'documento_identidad', headerName: 'RUC/DNI', minWidth: 120 },
  { field: 'proveedor', headerName: 'Proveedor', minWidth: 200 },
  { field: 'proyecto', headerName: 'Proyecto', minWidth: 120 },
  { field: 'oc', headerName: 'OC', minWidth: 100 },
  { field: 'cod_oc', headerName: 'Cód. OC', minWidth: 100 },
  { field: 'unidad_negocio', headerName: 'Unidad Negocio', minWidth: 130 },
  { field: 'id_proveedor', headerName: 'ID Proveedor', minWidth: 110 },
  { field: 'tipo_documento', headerName: 'Tipo Documento', minWidth: 130 },
  { field: 'estado_sunat', headerName: 'Estado SUNAT', minWidth: 120 },
  { field: 'prefijo', headerName: 'Prefijo', minWidth: 80 },
  { field: 'serie', headerName: 'Serie', minWidth: 80 },
  { field: 'numero_correlativo', headerName: 'Nro. Correlativo', minWidth: 120 },
  { field: 'moneda', headerName: 'Moneda', minWidth: 80 },
  { field: 'total_original', headerName: 'Total Original', minWidth: 120 },
  { field: 'pagado_original', headerName: 'Pagado Original', minWidth: 120 },
  { field: 'financiado_original', headerName: 'Financiado Orig.', minWidth: 130 },
  { field: 'letras_original', headerName: 'Letras Original', minWidth: 120 },
  { field: 'fondo_garantia', headerName: 'Fondo Garantía', minWidth: 120 },
  { field: 'carta_fianza', headerName: 'Carta Fianza', minWidth: 110 },
  { field: 'otras_retenciones', headerName: 'Otras Retenc.', minWidth: 120 },
  { field: 'total_financiado_5', headerName: 'Total Financ. 5', minWidth: 120 },
  { field: 'deducciones', headerName: 'Deducciones', minWidth: 110 },
  { field: 'pendiente_comp', headerName: 'Pendiente Comp.', minWidth: 130 },
  { field: 'pendiente_deduccion', headerName: 'Pendiente Deduc.', minWidth: 130 },
  { field: 'pendiente_letras', headerName: 'Pendiente Letras', minWidth: 130 },
  { field: 'pend_total_soles_origen', headerName: 'Pend. Total S/ Orig.', minWidth: 150 },
  { field: 'pend_total_dolares', headerName: 'Pend. Total US$', minWidth: 130 },
  { field: 'soles_total', headerName: 'S/ Total', minWidth: 110 },
  { field: 'soles_pagado', headerName: 'S/ Pagado', minWidth: 110 },
  { field: 'soles_financiado', headerName: 'S/ Financiado', minWidth: 120 },
  { field: 'soles_letras', headerName: 'S/ Letras', minWidth: 110 },
  { field: 'soles_fondo_garantia', headerName: 'S/ Fondo Garantía', minWidth: 140 },
  { field: 'soles_carta_fianza', headerName: 'S/ Carta Fianza', minWidth: 130 },
  { field: 'soles_otras_retenciones', headerName: 'S/ Otras Retenc.', minWidth: 140 },
  { field: 'soles_total_financiado_5', headerName: 'S/ Total Financ. 5', minWidth: 140 },
  { field: 'soles_deducciones', headerName: 'S/ Deducciones', minWidth: 130 },
  { field: 'soles_pendiente_comp', headerName: 'S/ Pend. Comp.', minWidth: 130 },
  { field: 'soles_pendiente_deduccion', headerName: 'S/ Pend. Deduc.', minWidth: 140 },
  { field: 'soles_pendiente_letras', headerName: 'S/ Pend. Letras', minWidth: 130 },
  { field: 'soles_pend_total_final', headerName: 'S/ Pend. Total Final', minWidth: 150 },
  { field: 'percepcion', headerName: 'Percepción', minWidth: 110 },
  { field: 'metodo_percepcion', headerName: 'Método Percepción', minWidth: 140 },
  { field: 'perc_emitida', headerName: 'Perc. Emitida', minWidth: 110 },
  { field: 'periodo_1', headerName: 'Periodo 1', minWidth: 100 },
  { field: 'correlativo_contable', headerName: 'Correlativo Contable', minWidth: 150 },
  { field: 'suma_percepcion', headerName: 'Suma Percepción', minWidth: 130 },
  { field: 'fecha_pago_real', headerName: 'Fecha Pago Real', minWidth: 130 },
  { field: 'id_tc_cancelacion', headerName: 'ID TC Cancelación', minWidth: 140 },
  { field: 'cuenta_cancelacion', headerName: 'Cuenta Cancelación', minWidth: 150 },
  { field: 'corr_cancelacion', headerName: 'Corr. Cancelación', minWidth: 140 },
  { field: 'cuenta_contable', headerName: 'Cuenta Contable', minWidth: 130 },
  { field: 'descripcion_cuenta', headerName: 'Descripción Cuenta', minWidth: 160 },
  { field: 'rubro', headerName: 'Rubro', minWidth: 100 },
  { field: 'cod_prov', headerName: 'Cód. Proveedor', minWidth: 120 },
  { field: 'id_moneda', headerName: 'ID Moneda', minWidth: 90 },
  { field: 'tipo_cambio', headerName: 'Tipo Cambio', minWidth: 110 },
  { field: 'total_local', headerName: 'Total Local', minWidth: 110 },
  { field: 'total_extranjero', headerName: 'Total Extranjero', minWidth: 120 },
  { field: 'id_contable', headerName: 'ID Contable', minWidth: 110 },
  { field: 'usuario_registro', headerName: 'Usuario Registro', minWidth: 130 },
  { field: 'observaciones', headerName: 'Observaciones', minWidth: 200 },
  { field: 'empleado_rendir', headerName: 'Empleado Rendir', minWidth: 130 },
  { field: 'id_empresa', headerName: 'ID Empresa', minWidth: 100 },
  { field: 'sigla_moneda', headerName: 'Sigla Moneda', minWidth: 100 },
  { field: 'nemonico', headerName: 'Nemónico', minWidth: 100 },
  { field: 'cant_anexos', headerName: 'Cant. Anexos', minWidth: 100 },
  { field: 'ind_validez_cpe', headerName: 'Ind. Validez CPE', minWidth: 130 },
  { field: 'id_estado_sunat', headerName: 'ID Estado SUNAT', minWidth: 130 },
  { field: 'fecha_doc_rel', headerName: 'Fecha Doc. Rel.', minWidth: 120 },
  { field: 'tipo_doc_rel', headerName: 'Tipo Doc. Rel.', minWidth: 120 },
  { field: 'serie_doc_rel', headerName: 'Serie Doc. Rel.', minWidth: 120 },
  { field: 'nro_doc_rel', headerName: 'Nro. Doc. Rel.', minWidth: 120 },
  { field: 'concatenar_factura', headerName: 'Concatenar Factura', minWidth: 150 },
  { field: 'fd_oc_almacen', headerName: 'FD OC Almacén', minWidth: 120 },
  { field: 'fd_etapa_n2_cod', headerName: 'FD Etapa N2 Cód.', minWidth: 130 },
  { field: 'fd_oc_comprador', headerName: 'FD OC Comprador', minWidth: 140 },
  { field: 'fd_etapa_n2', headerName: 'FD Etapa N2', minWidth: 120 },
  { field: 'as_comentarios_procura', headerName: 'AS Comentarios Procura', minWidth: 180 },
  { field: 'as_fee_no_valorizable', headerName: 'AS Fee No Valorizable', minWidth: 160 },
  { field: 'as_bd_val_presentacion', headerName: 'AS BD Val. Presentación', minWidth: 170 },
  { field: 'pqt_colegio', headerName: 'PQT Colegio', minWidth: 110 },
];

function buildColumnDefs(visibilityMap: Record<string, boolean>): ColDef[] {
  return columnConfig.map((col) => {
    const def: ColDef = {
      field: col.field,
      headerName: col.headerName,
      minWidth: col.minWidth || 100,
      hide: col.field === 'id_registro' ? false : visibilityMap[col.field] === false,
    };

    if (col.field === 'estado') {
      def.cellRenderer = StatusBadge;
    } else if (dateFields.has(col.field)) {
      def.cellRenderer = DateRenderer;
    } else if (amountFields.has(col.field)) {
      def.cellRenderer = AmountRenderer;
    }

    if (col.field === 'id_registro') {
      def.maxWidth = 100;
      def.pinned = 'left';
      def.lockPinned = true;
      def.cellClass = 'font-mono text-slate-400 text-xs';
    }

    return def;
  });
}

// --- App Navigation Links ---

const APP_LINKS = [
  { id: 'pqt06', name: 'PQT06 - Facturas', icon: FileText, url: '#', active: true },
  { id: 'pqt07', name: 'PQT07 - Pagos', icon: FileText, url: '#' },
  { id: 'pqt08', name: 'PQT08 - Contratos', icon: FileText, url: '#' },
];

// --- App Component ---

const App: React.FC = () => {
  const [started, setStarted] = useState(false);
  const [query, setQuery] = useState('');
  const [rowData, setRowData] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gridApi, setGridApi] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<Record<string, any>[]>([]);
  const [columnPanelOpen, setColumnPanelOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [visibilityMap, setVisibilityMap] = useState<Record<string, boolean>>(() => {
    const saved = loadVisibility();
    if (saved) return saved;
    // Default: all visible
    const all: Record<string, boolean> = {};
    columnConfig.forEach((c) => { all[c.field] = true; });
    return all;
  });
  const gridRef = useRef<AgGridReact>(null);

  const columnDefs = useMemo<ColDef[]>(() => buildColumnDefs(visibilityMap), [visibilityMap]);

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    suppressMovable: true,
    cellClass: 'text-xs',
  }), []);

  const fetchInvoices = useCallback(async (searchTerm: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('buscar_documentos_prod', {
        termino_busqueda: searchTerm
      });

      if (rpcError) {
        const { data: tableData, error: tableError } = await supabase
          .schema('cgoii-data-prod')
          .from('PQT06_Facturas_Consulta_Master')
          .select('*')
          .or(`proveedor.ilike.%${searchTerm}%,documento_identidad.ilike.%${searchTerm}%,empresa.ilike.%${searchTerm}%`)
          .limit(100);

        if (tableError) throw tableError;
        setRowData(tableData || []);
      } else {
        setRowData(data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Error al conectar con la base de datos');
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetch = useMemo(() => debounce((val: string) => fetchInvoices(val), 400), [fetchInvoices]);

  useEffect(() => {
    return () => debouncedFetch.cancel();
  }, [debouncedFetch]);

  const handleStart = useCallback(() => {
    setStarted(true);
    fetchInvoices('');
  }, [fetchInvoices]);

  // ENTER key to start from welcome screen
  useEffect(() => {
    if (started) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [started, handleStart]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    debouncedFetch(val);
  };

  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
  };

  const onExport = () => {
    if (gridApi) gridApi.exportDataAsCsv();
  };

  const onSelectionChanged = useCallback((event: SelectionChangedEvent) => {
    const selected = event.api.getSelectedRows();
    setSelectedRows(selected);
  }, []);

  // Calculate sum of total_original for selected rows
  const selectedSum = useMemo(() => {
    if (selectedRows.length === 0) return 0;
    return selectedRows.reduce((sum, row) => {
      const val = Number(row.total_original);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  }, [selectedRows]);

  const toggleColumn = useCallback((field: string) => {
    if (field === 'id_registro') return;
    setVisibilityMap((prev) => {
      const next = { ...prev, [field]: !prev[field] };
      saveVisibility(next);
      return next;
    });
  }, []);

  const showAllColumns = useCallback(() => {
    const all: Record<string, boolean> = {};
    columnConfig.forEach((c) => { all[c.field] = true; });
    setVisibilityMap(all);
    saveVisibility(all);
  }, []);

  const showRecommendedColumns = useCallback(() => {
    const rec: Record<string, boolean> = {};
    columnConfig.forEach((c) => { rec[c.field] = RECOMMENDED_COLUMNS.has(c.field); });
    setVisibilityMap(rec);
    saveVisibility(rec);
  }, []);

  const visibleCount = useMemo(() => Object.values(visibilityMap).filter(Boolean).length, [visibilityMap]);

  // --- Welcome Screen ---
  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#f8fafc] font-sans selection:bg-blue-100 selection:text-blue-900">
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg shadow-blue-500/20">
            <FileText className="w-10 h-10" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-[900] text-slate-800 tracking-tight uppercase">PQT06</h1>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Maestro de Facturas</p>
          </div>
          <p className="text-xs text-slate-400 mt-2">Consulta de facturas en tiempo real</p>
          <button
            onClick={handleStart}
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
  }

  // --- Main App ---
  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden animate-fade-in">
      {/* Left Sidebar */}
      <aside className={`h-full bg-white border-r border-slate-200 flex flex-col shrink-0 z-40 transition-all duration-200 ease-in-out ${sidebarOpen ? 'w-52' : 'w-12'}`}>
        <div className="h-11 flex items-center justify-center border-b border-slate-200 shrink-0">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            title={sidebarOpen ? 'Colapsar menú' : 'Expandir menú'}
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
        <nav className="flex-1 py-2 px-1.5 flex flex-col gap-0.5 overflow-y-auto">
          {APP_LINKS.map((app) => {
            const Icon = app.icon;
            return (
              <a
                key={app.id}
                href={app.active ? undefined : app.url}
                title={app.name}
                className={`flex items-center gap-2.5 rounded-md transition-colors ${sidebarOpen ? 'px-2.5 py-2' : 'px-0 py-2 justify-center'} ${app.active ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 cursor-pointer'}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {sidebarOpen && <span className="text-[11px] font-semibold truncate">{app.name}</span>}
              </a>
            );
          })}
        </nav>
      </aside>

      {/* Right content */}
      <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-11 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-sm font-[900] text-slate-800 leading-none tracking-tight uppercase">PQT06</h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Maestro de Facturas</p>
          </div>
        </div>

        <div className="relative flex-1 max-w-xl mx-6">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
            {loading ? <Loader2 className="h-3.5 w-3.5 text-blue-600 animate-spin" /> : <Search className="h-3.5 w-3.5 text-slate-400" />}
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 border-solid rounded-md text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-colors text-slate-700"
            placeholder="Buscar por proveedor, RUC, OC, serie-correlativo... (usa comas para combinar)"
            value={query}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setColumnPanelOpen((v) => !v)}
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
          <span className="text-xs text-slate-500 tabular-nums font-medium">{rowData.length} resultados</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 p-2 relative flex flex-col overflow-hidden">
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 min-w-[360px] p-3 bg-white border border-solid border-rose-400 rounded-lg shadow-lg flex items-center gap-3 text-rose-600 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1 font-medium text-xs">{error}</span>
            <button onClick={() => fetchInvoices(query)} className="bg-rose-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-rose-600 transition-colors">Reintentar</button>
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
            onGridReady={onGridReady}
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

        {/* Column visibility panel */}
        <div className={`absolute top-0 right-0 h-full w-72 bg-white border-l border-slate-200 shadow-lg z-50 flex flex-col transition-transform duration-200 ease-in-out ${columnPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="h-10 px-3 flex items-center justify-between border-b border-slate-200 shrink-0">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Columnas <span className="text-slate-400 font-medium normal-case tracking-normal">({visibleCount}/{columnConfig.length})</span></span>
            <button onClick={() => setColumnPanelOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-1.5 px-3 py-2 border-b border-slate-100 shrink-0">
            <button onClick={showAllColumns} className="flex-1 text-[10px] font-semibold px-2 py-1.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Mostrar todas</button>
            <button onClick={showRecommendedColumns} className="flex-1 text-[10px] font-semibold px-2 py-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">Recomendadas</button>
          </div>
          <div className="flex-1 overflow-y-auto px-1 py-1">
            {columnConfig.map((col) => (
              <label
                key={col.field}
                className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-slate-50 transition-colors ${col.field === 'id_registro' ? 'opacity-50 cursor-default' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={col.field === 'id_registro' ? true : visibilityMap[col.field] !== false}
                  disabled={col.field === 'id_registro'}
                  onChange={() => toggleColumn(col.field)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 focus:ring-offset-0"
                />
                <span className="text-[11px] text-slate-600 select-none">{col.headerName}</span>
              </label>
            ))}
          </div>
        </div>
      </main>

      {/* Selection bar */}
      {selectedRows.length > 0 && (
        <div className="h-8 bg-blue-600 px-4 flex items-center justify-between shrink-0 z-30 text-white text-xs font-medium">
          <span>{selectedRows.length} registro{selectedRows.length !== 1 ? 's' : ''} seleccionado{selectedRows.length !== 1 ? 's' : ''}</span>
          <span className="tabular-nums">
            Suma Total Original: <span className="font-bold">{selectedSum.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </span>
        </div>
      )}

      {/* Footer */}
      <footer className="h-7 bg-white border-t border-slate-200 px-4 flex items-center justify-between shrink-0 text-[9px] text-slate-400 font-medium z-30">
        <span>© 2026 RTL - hola@raultrujillo.com</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-emerald-500">
            <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
            Conectado
          </div>
        </div>
      </footer>
      </div>{/* end right content */}
    </div>
  );
};

export default App;
