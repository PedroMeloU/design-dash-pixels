
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const GpsPermission: React.FC = () => {
  const navigate = useNavigate();

  const handleAllowGps = () => {
    // Implementar lógica de permissão GPS aqui
    console.log('GPS permission granted');
    // Navegar para próxima tela ou dashboard
    alert('Permissão GPS concedida! Redirecionando...');
  };

  const handleDenyGps = () => {
    // Implementar lógica de negação GPS aqui
    console.log('GPS permission denied');
    alert('Permissão GPS negada. Algumas funcionalidades podem não estar disponíveis.');
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
          <div className="w-20 h-20 bg-[#1F3C88] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg 
              width="40" 
              height="40" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path 
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" 
                fill="currentColor"
              />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-[#1F3C88] mb-4">
            Permissão de Localização
          </h1>
          
          <p className="text-gray-700 text-base leading-relaxed mb-8">
            Para fornecer a melhor experiência, precisamos acessar sua localização. 
            Isso nos permite oferecer serviços personalizados baseados em onde você está.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleAllowGps}
              className="w-full bg-[#1F3C88] hover:bg-[#162d66] text-white font-normal text-lg h-[57px] rounded-lg transition-colors"
            >
              Permitir Localização
            </button>
            
            <button
              onClick={handleDenyGps}
              className="w-full border border-[#1F3C88] text-[#1F3C88] hover:bg-[#1F3C88] hover:text-white font-normal text-lg h-[57px] rounded-lg transition-colors"
            >
              Não Permitir
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default GpsPermission;
