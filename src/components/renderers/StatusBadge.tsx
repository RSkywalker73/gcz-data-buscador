import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import type { ICellRendererParams } from 'ag-grid-community';

export const StatusBadge = (params: ICellRendererParams) => {
  const status = params.value as string;
  if (!status) return null;

  const getStatusStyles = (status: string) => {
    const s = status.toLowerCase().trim();
    // PQT06: estados de factura
    if (s.includes('pagado')) return { bg: 'bg-emerald-500/10', text: 'text-emerald-700', dot: 'bg-emerald-500', icon: <CheckCircle2 className="w-3 h-3" /> };
    if (s.includes('anulado') || s.includes('cancelado')) return { bg: 'bg-rose-500/10', text: 'text-rose-700', dot: 'bg-rose-500', icon: <XCircle className="w-3 h-3" /> };
    if (s.includes('pendiente') || s.includes('proceso')) return { bg: 'bg-amber-500/10', text: 'text-amber-700', dot: 'bg-amber-500', icon: <Clock className="w-3 h-3" /> };
    // BD Valorizaciones: estados de aprobación
    if (s === 'si') return { bg: 'bg-emerald-500/10', text: 'text-emerald-700', dot: 'bg-emerald-500', icon: <CheckCircle2 className="w-3 h-3" /> };
    if (s === 'no') return { bg: 'bg-rose-500/10', text: 'text-rose-700', dot: 'bg-rose-500', icon: <XCircle className="w-3 h-3" /> };
    if (s.includes('parcial')) return { bg: 'bg-amber-500/10', text: 'text-amber-700', dot: 'bg-amber-500', icon: <Clock className="w-3 h-3" /> };
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
