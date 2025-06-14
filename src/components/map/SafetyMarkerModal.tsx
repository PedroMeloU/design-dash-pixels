
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getSafetyColor } from "./getSafetyColor";
import { getSafetyIcon } from "./getSafetyIcon";
import { getSafetyLabel } from "./getSafetyLabel";

interface SafetyIncident {
  incident_type: string;
  date: string;
  deaths: number;
  wounded: number;
}

interface SafetyData {
  neighborhood: string;
  city: string;
  state: string;
  safety_percentage: number;
  crime_count: number;
  last_calculated: string;
}

interface SafetyMarkerModalProps {
  open: boolean;
  onClose: () => void;
  data: SafetyData | null;
  relatedIncidents: SafetyIncident[];
}

export const SafetyMarkerModal: React.FC<SafetyMarkerModalProps> = ({
  open,
  onClose,
  data,
  relatedIncidents,
}) => {
  if (!data) return null;
  const color = getSafetyColor(data.safety_percentage);
  const icon = getSafetyIcon(data.safety_percentage);
  const label = getSafetyLabel(data.safety_percentage);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full rounded-lg shadow-lg bg-white">
        <div className="p-2">
          <h3
            className="text-lg font-semibold mb-3 flex items-center gap-1"
            style={{ color }}
          >
            <span>{icon}</span> <span>{data.neighborhood}</span>
          </h3>
          <div className="text-sm space-y-1.5">
            <div className="flex justify-between mb-1">
              <span className="font-medium">Índice de Segurança:</span>
              <span style={{ color, fontWeight: 600 }}>
                {data.safety_percentage.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">Classificação:</span>
              <span style={{ color, fontWeight: 600 }}>{label}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">Ocorrências (6 meses):</span>
              <span>{data.crime_count}</span>
            </div>
            <div className="text-xs text-gray-500 mt-2 border-t pt-2">
              Última atualização:{" "}
              {new Date(data.last_calculated).toLocaleDateString("pt-BR")}
            </div>
            {relatedIncidents.length > 0 && (
              <div className="mt-2 text-xs">
                <strong>Ocorrências recentes:</strong>
                <ul className="pl-4 mt-1 list-disc space-y-0.5">
                  {relatedIncidents.map((inc, idx) => (
                    <li key={idx}>
                      <span title={new Date(inc.date).toLocaleString("pt-BR")}>
                        {new Date(inc.date).toLocaleDateString("pt-BR")}
                      </span>{" "}
                      - {inc.incident_type}
                      {inc.deaths ? (
                        <span className="text-red-600">
                          , Mortes: {inc.deaths}
                        </span>
                      ) : null}
                      {inc.wounded ? (
                        <span className="text-orange-600">
                          , Feridos: {inc.wounded}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
