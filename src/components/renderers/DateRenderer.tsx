import type { ICellRendererParams } from 'ag-grid-community';

export const DateRenderer = (params: ICellRendererParams) => {
  if (!params.value) return null;
  const date = new Date(params.value);
  if (isNaN(date.getTime())) return <span>{params.value}</span>;
  return (
    <span className="text-slate-600 text-xs">
      {date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })}
    </span>
  );
};
