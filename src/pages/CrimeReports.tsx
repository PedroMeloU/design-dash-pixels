
import React from 'react';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { AlertTriangle, MapPin, Clock, Phone } from 'lucide-react';

const CrimeReports: React.FC = () => {
  const mockReports = [
    {
      id: 1,
      type: 'Furto',
      location: 'Rua Augusta, 123',
      time: '2 horas atrás',
      severity: 'medium'
    },
    {
      id: 2,
      type: 'Assalto',
      location: 'Av. Paulista, 456',
      time: '5 horas atrás',
      severity: 'high'
    },
    {
      id: 3,
      type: 'Vandalismo',
      location: 'Rua Oscar Freire, 789',
      time: '1 dia atrás',
      severity: 'low'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <main className="h-screen w-full bg-[#F5F7FA] flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <h1 className="text-2xl font-bold text-[#1F3C88] flex items-center gap-2">
          <AlertTriangle size={28} />
          Reportes de Crimes
        </h1>
        <p className="text-gray-600 mt-1">Acompanhe os incidentes na sua região</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-28">
        {/* Emergency Button */}
        <div className="bg-red-500 rounded-lg p-4 mb-6 shadow-sm">
          <button className="w-full flex items-center justify-center gap-3 text-white font-semibold text-lg">
            <Phone size={24} />
            Emergência: 190
          </button>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Reportes Recentes</h2>
          
          {mockReports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={20} className="text-[#1F3C88]" />
                  <h3 className="font-semibold text-gray-800">{report.type}</h3>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(report.severity)}`}>
                  {report.severity === 'high' ? 'Alto' : report.severity === 'medium' ? 'Médio' : 'Baixo'}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={16} />
                  <span className="text-sm">{report.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock size={16} />
                  <span className="text-sm">{report.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Report Button */}
        <div className="mt-6 mb-4">
          <button className="w-full bg-[#1F3C88] text-white rounded-lg py-3 font-semibold text-lg shadow-sm hover:bg-[#1a3470] transition-colors">
            Reportar Incidente
          </button>
        </div>
      </div>

      <BottomNavigation />
    </main>
  );
};

export default CrimeReports;
