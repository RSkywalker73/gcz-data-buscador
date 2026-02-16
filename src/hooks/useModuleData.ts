import { useState, useCallback, useMemo, useEffect } from 'react';
import debounce from 'lodash.debounce';
import { supabase } from '../supabase';
import type { ModuleConfig } from '../types/module';

export function useModuleData(moduleConfig: ModuleConfig) {
  const [query, setQuery] = useState('');
  const [rowData, setRowData] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (searchTerm: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc(moduleConfig.rpcFunction, {
        termino_busqueda: searchTerm,
      });

      if (rpcError) {
        const orClauses = moduleConfig.fallbackSearchFields
          .map((f) => `${f}.ilike.%${searchTerm}%`)
          .join(',');

        const { data: tableData, error: tableError } = await supabase
          .schema(moduleConfig.schema)
          .from(moduleConfig.tableName)
          .select('*')
          .or(orClauses)
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
  }, [moduleConfig.rpcFunction, moduleConfig.schema, moduleConfig.tableName, moduleConfig.fallbackSearchFields]);

  const debouncedFetch = useMemo(
    () => debounce((val: string) => fetchData(val), 400),
    [fetchData]
  );

  useEffect(() => {
    return () => debouncedFetch.cancel();
  }, [debouncedFetch]);

  const handleSearchChange = useCallback((value: string) => {
    setQuery(value);
    debouncedFetch(value);
  }, [debouncedFetch]);

  const initialFetch = useCallback(() => {
    fetchData('');
  }, [fetchData]);

  return { query, rowData, loading, error, handleSearchChange, fetchData, initialFetch };
}
