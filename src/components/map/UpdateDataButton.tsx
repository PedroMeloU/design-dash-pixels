
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface UpdateDataButtonProps {
  onUpdate: () => Promise<any>;
  isUpdating: boolean;
}

export const UpdateDataButton: React.FC<UpdateDataButtonProps> = ({ onUpdate, isUpdating }) => {
  const handleUpdate = async () => {
    try {
      toast.info('Atualizando dados do Fogo Cruzado...');
      const result = await onUpdate();
      toast.success(`Dados atualizados! ${result.new_incidents} novos incidentes adicionados.`);
    } catch (error) {
      console.error('Error updating data:', error);
      toast.error('Erro ao atualizar dados. Tente novamente.');
    }
  };

  return (
    <div className="absolute top-4 left-4 z-20">
      <Button
        onClick={handleUpdate}
        disabled={isUpdating}
        size="sm"
        className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 shadow-lg"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
        {isUpdating ? 'Atualizando...' : 'Atualizar Dados'}
      </Button>
    </div>
  );
};
