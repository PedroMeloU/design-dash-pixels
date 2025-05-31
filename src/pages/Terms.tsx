
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Terms: React.FC = () => {
  const navigate = useNavigate();

  const handleAccept = () => {
    navigate('/gps-permission');
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
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 max-sm:p-6">
          <h1 className="text-2xl font-bold text-[#1F3C88] text-center mb-6">
            Termos de Uso
          </h1>
          
          <div className="space-y-4 mb-8 max-h-64 overflow-y-auto">
            <p className="text-gray-700 text-sm leading-relaxed">
              Ao usar este aplicativo, você concorda com os seguintes termos e condições de uso.
            </p>
            
            <p className="text-gray-700 text-sm leading-relaxed">
              1. O aplicativo coleta dados de localização para fornecer serviços personalizados.
            </p>
            
            <p className="text-gray-700 text-sm leading-relaxed">
              2. Seus dados pessoais serão protegidos de acordo com nossa política de privacidade.
            </p>
            
            <p className="text-gray-700 text-sm leading-relaxed">
              3. Você pode revogar as permissões a qualquer momento nas configurações do dispositivo.
            </p>
            
            <p className="text-gray-700 text-sm leading-relaxed">
              4. O uso inadequado do aplicativo pode resultar na suspensão da conta.
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handleAccept}
              className="w-full bg-[#1F3C88] hover:bg-[#162d66] text-white font-normal text-lg h-[57px] rounded-lg transition-colors"
            >
              Aceitar Termos
            </button>
            
            <button
              onClick={() => navigate(-1)}
              className="w-full border border-[#1F3C88] text-[#1F3C88] hover:bg-[#1F3C88] hover:text-white font-normal text-lg h-[57px] rounded-lg transition-colors"
            >
              Recusar
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Terms;
