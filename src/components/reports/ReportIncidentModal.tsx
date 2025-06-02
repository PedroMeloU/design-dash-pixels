
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Calendar, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CRIME_TYPES = [
  { value: 'homicidio_doloso', label: 'Homicídio Doloso' },
  { value: 'latrocinio', label: 'Latrocínio' },
  { value: 'lesao_corporal_morte', label: 'Lesão Corporal seguida de Morte' },
  { value: 'roubo_transeunte', label: 'Roubo a Transeunte' },
  { value: 'estupro', label: 'Estupro' },
  { value: 'tentativa_homicidio', label: 'Tentativa de Homicídio' },
  { value: 'furto', label: 'Furto' },
  { value: 'roubo_veiculo', label: 'Roubo de Veículo' },
  { value: 'outros', label: 'Outros' }
];

export const ReportIncidentModal: React.FC<ReportIncidentModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    crime_type: '',
    description: '',
    address: '',
    neighborhood: '',
    occurred_at: new Date().toISOString().slice(0, 16)
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          toast({
            title: "Localização obtida",
            description: "Sua localização atual foi capturada com sucesso."
          });
        },
        (error) => {
          toast({
            title: "Erro de localização",
            description: "Não foi possível obter sua localização atual.",
            variant: "destructive"
          });
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userLocation) {
      toast({
        title: "Localização necessária",
        description: "Por favor, capture sua localização antes de enviar o relatório.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para reportar um incidente.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase.from('crime_reports').insert({
        user_id: user.user.id,
        crime_type: formData.crime_type,
        description: formData.description,
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        address: formData.address,
        neighborhood: formData.neighborhood,
        occurred_at: formData.occurred_at
      });

      if (error) throw error;

      toast({
        title: "Relatório enviado",
        description: "Seu relatório foi enviado com sucesso e ajudará a melhorar a segurança da região."
      });

      setFormData({
        crime_type: '',
        description: '',
        address: '',
        neighborhood: '',
        occurred_at: new Date().toISOString().slice(0, 16)
      });
      setUserLocation(null);
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Erro ao enviar relatório",
        description: "Ocorreu um erro ao enviar seu relatório. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="text-[#1F3C88]" size={24} />
            Reportar Incidente
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Tipo de Crime</label>
            <Select value={formData.crime_type} onValueChange={(value) => setFormData({...formData, crime_type: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de crime" />
              </SelectTrigger>
              <SelectContent>
                {CRIME_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Localização</label>
            <Button 
              type="button" 
              variant="outline" 
              onClick={getCurrentLocation}
              className="w-full"
              disabled={!!userLocation}
            >
              <MapPin size={16} className="mr-2" />
              {userLocation ? 'Localização capturada' : 'Capturar minha localização'}
            </Button>
            {userLocation && (
              <p className="text-xs text-gray-600 mt-1">
                Lat: {userLocation.lat.toFixed(6)}, Lng: {userLocation.lng.toFixed(6)}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Endereço</label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="Rua, número, referências..."
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Bairro</label>
            <Input
              value={formData.neighborhood}
              onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
              placeholder="Nome do bairro"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Data e Hora do Ocorrido</label>
            <Input
              type="datetime-local"
              value={formData.occurred_at}
              onChange={(e) => setFormData({...formData, occurred_at: e.target.value})}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Descrição</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descreva o que aconteceu..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.crime_type || !userLocation}
              className="flex-1 bg-[#1F3C88] hover:bg-[#1a3470]"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Relatório'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
