import React, { useState, useEffect } from 'react';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { Heart, MapPin, Star, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface FavoriteLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  notes?: string;
  created_at: string;
}

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFavorite, setNewFavorite] = useState({
    name: '',
    address: '',
    notes: ''
  });
  const { user } = useAuth();

  const fetchFavorites = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('favorite_locations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao carregar favoritos:', error);
      toast.error('Erro ao carregar favoritos');
    } else {
      setFavorites(data || []);
    }
    setLoading(false);
  };

  const addFavorite = async () => {
    if (!user || !newFavorite.name.trim() || !newFavorite.address.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      // Geocodificar o endereço usando Mapbox
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(newFavorite.address)}.json?access_token=pk.eyJ1IjoicGVkcm9tZWxvIiwiYSI6ImNtYmQ0NnU2ZjF1eG0ybW9kampic2l0dnIifQ.3AKo52hZMDfkH54OitiNuA&country=br&limit=1`
      );
      
      if (!response.ok) throw new Error('Erro ao geocodificar endereço');
      
      const data = await response.json();
      if (data.features.length === 0) {
        toast.error('Endereço não encontrado');
        return;
      }

      const [longitude, latitude] = data.features[0].center;

      const { error } = await supabase
        .from('favorite_locations')
        .insert({
          user_id: user.id,
          name: newFavorite.name.trim(),
          address: newFavorite.address.trim(),
          latitude,
          longitude,
          notes: newFavorite.notes.trim() || null
        });

      if (error) {
        console.error('Erro ao adicionar favorito:', error);
        toast.error('Erro ao adicionar favorito');
      } else {
        toast.success('Local adicionado aos favoritos!');
        setNewFavorite({ name: '', address: '', notes: '' });
        setIsAddModalOpen(false);
        fetchFavorites();
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao adicionar favorito');
    }
  };

  const removeFavorite = async (id: string) => {
    const { error } = await supabase
      .from('favorite_locations')
      .delete()
      .eq('id', id)
      .eq('user_id', user?.id);

    if (error) {
      console.error('Erro ao remover favorito:', error);
      toast.error('Erro ao remover favorito');
    } else {
      toast.success('Favorito removido!');
      fetchFavorites();
    }
  };

  const navigateToLocation = (favorite: FavoriteLocation) => {
    // Abrir no Google Maps ou app de mapas padrão
    const url = `https://www.google.com/maps?q=${favorite.latitude},${favorite.longitude}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  return (
    <main className="h-screen w-full bg-[#F5F7FA] flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4 pt-safe">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1F3C88] flex items-center gap-2">
              <Heart size={24} className="sm:w-7 sm:h-7" />
              Favoritos
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Seus lugares favoritos</p>
          </div>
          
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1F3C88] hover:bg-[#1a3470]">
                <Plus size={16} className="mr-2" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Adicionar Local Favorito</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Nome do Local *
                  </label>
                  <Input
                    placeholder="Ex: Casa, Trabalho, Academia..."
                    value={newFavorite.name}
                    onChange={(e) => setNewFavorite({ ...newFavorite, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Endereço *
                  </label>
                  <Input
                    placeholder="Digite o endereço completo"
                    value={newFavorite.address}
                    onChange={(e) => setNewFavorite({ ...newFavorite, address: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Notas (opcional)
                  </label>
                  <Input
                    placeholder="Observações sobre o local..."
                    value={newFavorite.notes}
                    onChange={(e) => setNewFavorite({ ...newFavorite, notes: e.target.value })}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={addFavorite}
                    className="flex-1 bg-[#1F3C88] hover:bg-[#1a3470]"
                  >
                    Adicionar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3C88]"></div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Heart size={48} className="text-gray-300 mb-4" />
            <h2 className="text-lg font-semibold text-gray-600 mb-2">Nenhum favorito ainda</h2>
            <p className="text-gray-500 mb-6 max-w-sm">
              Adicione seus locais favoritos para acessá-los rapidamente
            </p>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#1F3C88] hover:bg-[#1a3470]"
            >
              <Plus size={16} className="mr-2" />
              Adicionar Primeiro Favorito
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-[#1F3C88] rounded-full flex items-center justify-center flex-shrink-0">
                      <Star size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{favorite.name}</h3>
                      <div className="flex items-center gap-1 text-gray-600 mt-1">
                        <MapPin size={14} />
                        <span className="text-sm truncate">{favorite.address}</span>
                      </div>
                      {favorite.notes && (
                        <p className="text-sm text-gray-500 mt-2">{favorite.notes}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Adicionado em {new Date(favorite.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFavorite(favorite.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigateToLocation(favorite)}
                    className="flex-1 bg-[#1F3C88] hover:bg-[#1a3470]"
                    size="sm"
                  >
                    <MapPin size={14} className="mr-2" />
                    Ver no Mapa
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </main>
  );
};

export default Favorites;

