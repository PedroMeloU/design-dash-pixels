
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Este hook procura todos os reports semelhantes de diferentes usuários para o mesmo tipo, bairro e período e retorna se o report está "confirmado".
 * Se houver ao menos 3 reports diferentes, confirma todos.
 */
export const useConfirmIncident = () => {
  const confirmIfNecessary = useCallback(async (report: {
    id: string;
    crime_type: string;
    neighborhood: string;
    occurred_at: string;
  }) => {
    // Seleciona todos relatórios compatíveis para o mesmo tipo+bairro/dentro de 48h
    const twoDaysAgo = new Date(new Date(report.occurred_at).getTime() - 48 * 60 * 60 * 1000).toISOString();
    const res = await supabase
      .from('crime_reports')
      .select('id, user_id')
      .eq('crime_type', report.crime_type)
      .eq('neighborhood', report.neighborhood)
      .gte('occurred_at', twoDaysAgo)
      .lte('occurred_at', report.occurred_at);

    if (!res.error && res.data) {
      // Quantos usuários únicos?
      const uniqueUsers = [...new Set(res.data.map((r: any) => r.user_id))].filter(Boolean);
      if (uniqueUsers.length >= 3) {
        // Confirma todos estes reports
        const idsToConfirm = res.data.map((r: any) => r.id);
        await supabase.from('crime_reports')
          .update({ status: 'Confirmada' })
          .in('id', idsToConfirm);
        return true;
      }
    }
    return false;
  }, []);

  return { confirmIfNecessary };
};
