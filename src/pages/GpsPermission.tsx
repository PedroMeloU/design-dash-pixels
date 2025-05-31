
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';

const GpsPermission: React.FC = () => {
  const navigate = useNavigate();

  const handleAllowLocation = () => {
    // Simular solicitação de permissão GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Localização obtida:', position);
          navigate('/dashboard');
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          // Mesmo com erro, redirecionar para o dashboard
          navigate('/dashboard');
        }
      );
    } else {
      console.log('Geolocalização não suportada');
      navigate('/dashboard');
    }
  };

  return (
    <main className="w-full min-h-screen bg-[#F5F7FA] flex flex-col relative">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 p-2 text-[#1F3C88] hover:bg-white/50 rounded-lg transition-colors z-10"
        aria-label="Voltar"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center px-5 max-sm:px-4 pt-16">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 max-sm:p-6 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-[#1F3C88]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={40} className="text-[#1F3C88]" />
            </div>
            <h1 className="text-2xl font-bold text-[#1F3C88] mb-4">
              Permitir Localização
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              Para oferecer a melhor experiência, precisamos acessar sua localização para mostrar lugares próximos a você.
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handleAllowLocation}
              className="w-full bg-[#1F3C88] hover:bg-[#162d66] text-white font-normal text-lg h-[57px] rounded-lg transition-colors"
            >
              Permitir Localização
            </button>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full border border-[#1F3C88] text-[#1F3C88] hover:bg-[#1F3C88] hover:text-white font-normal text-lg h-[57px] rounded-lg transition-colors"
            >
              Pular por Agora
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default GpsPermission;
