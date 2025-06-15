import React, { useState, useEffect } from 'react';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { ReportIncidentModal } from '@/components/reports/ReportIncidentModal';
import { AlertTriangle, MapPin, Clock, Phone, User2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const CrimeReports: React.FC = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('crime_reports')
      .select(`
        id, crime_type, description, occurred_at, latitude, longitude, address, neighborhood, status, user_id,
        users:user_id ( email )
      `)
      .order('occurred_at', { ascending: false })
      .limit(50);
    if (!error) setReports(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
    // Recarregar ao enviar ocorrência
    const channel = supabase.channel('crime_reports-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'crime_reports' }, fetchReports)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getUserName = (report: any) => {
    // Tente mostrar o email anonímizado (antes do @) como identificação
    if (report.users?.email)
      return report.users.email.split('@')[0];
    return "Usuário";
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'homicidio_doloso': return 'Homicídio Doloso';
      case 'latrocinio': return 'Latrocínio';
      case 'lesao_corporal_morte': return 'Lesão Corp. Morte';
      case 'roubo_transeunte': return 'Roubo a Transeunte';
      case 'estupro': return 'Estupro';
      case 'tentativa_homicidio': return 'Tent. Homicídio';
      case 'furto': return 'Furto';
      case 'roubo_veiculo': return 'Roubo de Veículo';
      case 'outros': return 'Outros';
      default: return type;
    }
  };

  const getSeverityColor = (type: string) => {
    if (type === 'homicidio_doloso' || type === 'latrocinio' || type === 'estupro')
      return 'bg-red-100 text-red-800 border-red-200';
    if (type === 'roubo_transeunte' || type === 'tentativa_homicidio')
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  return (
    <main className="h-screen w-full bg-[#F5F7FA] flex flex-col">
      <div className="bg-white shadow-sm border-b border-gray-200 p-4 pt-safe">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1F3C88] flex items-center gap-2">
          <AlertTriangle size={24} className="sm:w-7 sm:h-7" />
          Reportes de Crimes
        </h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Acompanhe os incidentes na sua região</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="bg-red-500 rounded-xl p-4 mb-6 shadow-sm">
          <button className="w-full flex items-center justify-center gap-3 text-white font-semibold text-lg"
            onClick={() => window.open('tel:190')}>
            <Phone size={24} />
            Emergência: 190
          </button>
        </div>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Reportes Recentes</h2>
          {loading ? (
            <div className="text-gray-500">Carregando...</div>
          ) : reports.length === 0 ? (
            <div className="text-gray-500">Nenhum reporte encontrado.</div>
          ) : reports.map((report) => (
            <div key={report.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={20} className="text-[#1F3C88]" />
                  <h3 className="font-semibold text-gray-800">{getTypeLabel(report.crime_type)}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(report.crime_type)}`}>
                  {report.status}
                </span>
              </div>
              <div className="flex gap-2 items-center mb-2 text-gray-700 text-xs">
                <User2 size={14} />
                <span>{getUserName(report)}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={16} />
                  <span className="text-sm">{report.address || "Localização não informada"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock size={16} />
                  <span className="text-sm">{new Date(report.occurred_at).toLocaleString('pt-BR')}</span>
                </div>
                <div className="text-sm text-gray-700">
                  {report.description}
                </div>
              </div>
              {report.status === "Em apuração" && (
                <div className="mt-2 text-xs text-yellow-700 font-medium">
                  🔍 Ainda em apuração. O reporte só será confirmado se houver relatos semelhantes de outros usuários.
                </div>
              )}
              {report.status === "Confirmada" && (
                <div className="mt-2 text-xs text-green-700 font-medium">
                  ✅ Ocorrência confirmada por múltiplos usuários.
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 mb-4">
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="w-full bg-[#1F3C88] text-white rounded-xl py-4 font-semibold text-lg shadow-sm hover:bg-[#1a3470] transition-colors active:scale-98"
          >
            Reportar Incidente
          </button>
        </div>
      </div>
      <BottomNavigation />
      <ReportIncidentModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
      />
    </main>
  );
};

export default CrimeReports;
