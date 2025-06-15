
import { useEffect } from 'react';
import { useConfirmIncident } from '@/hooks/useConfirmIncident';
import { supabase } from '@/integrations/supabase/client';

/**
 * Este componente escuta todas novas ocorrências enviadas
 * e, ao detectar novas de status 'Em apuração', tenta confirmar (caso haja pelo menos 3 relatos semelhantes de usuários diferentes).
 */
export const AutoIncidentConfirmation: React.FC = () => {
  const { confirmIfNecessary } = useConfirmIncident();

  useEffect(() => {
    // Assina inserções de novas ocorrências
    const channel = supabase.channel('auto-confirm-incidents')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'crime_reports',
      }, async (payload) => {
        const newReport = payload.new;
        if (newReport.status === 'Em apuração') {
          await confirmIfNecessary({
            id: newReport.id,
            crime_type: newReport.crime_type,
            neighborhood: newReport.neighborhood,
            occurred_at: newReport.occurred_at,
          });
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [confirmIfNecessary]);
  return null;
};
