
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, MapPin, Users, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Introduction: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="w-full min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E8ECF3] flex flex-col">
      <div className="flex-1 px-5 py-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-[#1F3C88] rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#1F3C88] mb-4">
            SigaSeguro
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Conheça os níveis de segurança da sua cidade antes de sair de casa
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-[#1F3C88]" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Visualização no Mapa</h3>
              <p className="text-gray-600 text-sm">
                Veja as informações de segurança diretamente no mapa da sua região
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Eye className="w-6 h-6 text-[#1F3C88]" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Dados Confiáveis</h3>
              <p className="text-gray-600 text-sm">
                Informações baseadas em dados públicos oficiais e verificados
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-[#1F3C88]" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Comunidade</h3>
              <p className="text-gray-600 text-sm">
                Colaboração da comunidade para informações mais precisas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#1F3C88] mb-6 text-center">
            Como Funciona
          </h2>
          
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-[#1F3C88] text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Identificação de Áreas
                </h3>
                <p className="text-gray-600">
                  O app analisa dados públicos de segurança e relatórios da comunidade para identificar quais áreas são mais seguras ou apresentam maior risco.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-[#1F3C88] text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Visualização Intuitiva
                </h3>
                <p className="text-gray-600">
                  As informações são apresentadas de forma visual e clara no mapa, usando cores e indicadores que facilitam a compreensão dos níveis de segurança.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-[#1F3C88] text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Decisões Informadas
                </h3>
                <p className="text-gray-600">
                  Com essas informações, você pode planejar melhor seus trajetos e tomar decisões mais conscientes sobre onde ir e quando.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button
              onClick={() => navigate('/login')}
              className="flex-1 bg-[#1F3C88] hover:bg-[#162d66] text-white font-medium text-lg h-12 rounded-xl"
            >
              Entrar
            </Button>
            <Button
              onClick={() => navigate('/signup')}
              variant="outline"
              className="flex-1 border-[#1F3C88] text-[#1F3C88] hover:bg-[#1F3C88] hover:text-white font-medium text-lg h-12 rounded-xl"
            >
              Criar Conta
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            Seus dados estão seguros e protegidos
          </p>
        </div>
      </div>
    </main>
  );
};

export default Introduction;
