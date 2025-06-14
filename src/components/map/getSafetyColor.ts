
/**
 * Retorna uma cor representando o nível de segurança dado o índice.
 */
export const getSafetyColor = (safetyPercentage: number): string => {
  if (safetyPercentage >= 80) return '#10B981'; // Verde - Muito seguro
  if (safetyPercentage >= 60) return '#F59E0B'; // Amarelo - Moderadamente seguro
  if (safetyPercentage >= 40) return '#EF4444'; // Vermelho - Pouco seguro
  return '#7F1D1D'; // Vermelho escuro - Muito perigoso
};
