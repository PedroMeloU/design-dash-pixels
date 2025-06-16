import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { User, Settings, Bell, Shield, HelpCircle, LogOut, Edit, Save, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  emergency_contact?: string;
  notifications_enabled: boolean;
  location_sharing: boolean;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    full_name: '',
    phone: '',
    emergency_contact: ''
  });
  const [settings, setSettings] = useState({
    notifications_enabled: true,
    location_sharing: true
  });
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao carregar perfil:', error);
    } else if (data) {
      setProfile(data);
      setEditData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        emergency_contact: data.emergency_contact || ''
      });
      setSettings({
        notifications_enabled: data.notifications_enabled,
        location_sharing: data.location_sharing
      });
    } else {
      // Criar perfil inicial
      const newProfile = {
        id: user.id,
        email: user.email || '',
        full_name: null,
        phone: null,
        emergency_contact: null,
        notifications_enabled: true,
        location_sharing: true
      };
      
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert(newProfile);
        
      if (!insertError) {
        setProfile(newProfile);
      }
    }
    setLoading(false);
  };

  const saveProfile = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        email: user.email || '',
        full_name: editData.full_name.trim() || null,
        phone: editData.phone.trim() || null,
        emergency_contact: editData.emergency_contact.trim() || null,
        notifications_enabled: settings.notifications_enabled,
        location_sharing: settings.location_sharing
      });

    if (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Erro ao salvar perfil');
    } else {
      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
      fetchProfile();
    }
  };

  const updateSettings = async (key: string, value: boolean) => {
    if (!user) return;

    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        email: user.email || '',
        [key]: value
      });

    if (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast.error('Erro ao atualizar configuração');
      // Reverter mudança em caso de erro
      setSettings(settings);
    } else {
      toast.success('Configuração atualizada!');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/', { replace: true });
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <main className="h-screen w-full bg-[#F5F7FA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3C88]"></div>
      </main>
    );
  }

  return (
    <main className="h-screen w-full bg-[#F5F7FA] flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4 pt-safe">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1F3C88] flex items-center gap-2">
          <User size={24} className="sm:w-7 sm:h-7" />
          Perfil
        </h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Gerencie suas configurações e dados</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        {/* User Info Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#1F3C88] rounded-full flex items-center justify-center">
                <User size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">
                  {profile?.full_name || 'Usuário'}
                </h2>
                <p className="text-gray-600">{profile?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (isEditing) {
                  setIsEditing(false);
                  setEditData({
                    full_name: profile?.full_name || '',
                    phone: profile?.phone || '',
                    emergency_contact: profile?.emergency_contact || ''
                  });
                } else {
                  setIsEditing(true);
                }
              }}
            >
              {isEditing ? <X size={16} /> : <Edit size={16} />}
            </Button>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Nome Completo
                </label>
                <Input
                  value={editData.full_name}
                  onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                  placeholder="Digite seu nome completo"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Telefone
                </label>
                <Input
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Contato de Emergência
                </label>
                <Input
                  value={editData.emergency_contact}
                  onChange={(e) => setEditData({ ...editData, emergency_contact: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={saveProfile}
                  className="flex-1 bg-[#1F3C88] hover:bg-[#1a3470]"
                >
                  <Save size={16} className="mr-2" />
                  Salvar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">Telefone: </span>
                <span className="text-gray-900">{profile?.phone || 'Não informado'}</span>
              </div>
              <div>
                <span className="text-gray-500">Contato de Emergência: </span>
                <span className="text-gray-900">{profile?.emergency_contact || 'Não informado'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Settings size={20} />
            Configurações
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Notificações</p>
                <p className="text-sm text-gray-500">Receber alertas de segurança</p>
              </div>
              <Switch
                checked={settings.notifications_enabled}
                onCheckedChange={(checked) => updateSettings('notifications_enabled', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Compartilhar Localização</p>
                <p className="text-sm text-gray-500">Permitir acesso à sua localização</p>
              </div>
              <Switch
                checked={settings.location_sharing}
                onCheckedChange={(checked) => updateSettings('location_sharing', checked)}
              />
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-3 mb-6">
          <button className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center gap-4 transition-all hover:bg-gray-50 active:scale-98">
            <Bell size={20} className="text-[#1F3C88]" />
            <span className="flex-1 text-left font-medium text-gray-900">Histórico de Notificações</span>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </button>
          
          <button className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center gap-4 transition-all hover:bg-gray-50 active:scale-98">
            <Shield size={20} className="text-[#1F3C88]" />
            <span className="flex-1 text-left font-medium text-gray-900">Privacidade e Segurança</span>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </button>
          
          <button className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center gap-4 transition-all hover:bg-gray-50 active:scale-98">
            <HelpCircle size={20} className="text-[#1F3C88]" />
            <span className="flex-1 text-left font-medium text-gray-900">Ajuda e Suporte</span>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </button>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center gap-4 transition-all hover:bg-red-50 active:scale-98 text-red-600"
        >
          <LogOut size={20} className="text-red-500" />
          <span className="flex-1 text-left font-medium">Sair</span>
        </button>

        {/* App Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">SigaSeguro v1.0.0</p>
          <p className="text-gray-400 text-xs mt-1">© 2024 Safety App</p>
        </div>
      </div>

      <BottomNavigation />
    </main>
  );
};

export default Profile;

