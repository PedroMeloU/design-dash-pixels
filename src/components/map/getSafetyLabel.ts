
/**
 * Retorna um texto descritivo do nível de segurança.
 */
export const getSafetyLabel = (safetyPercentage: number): string => {
  if (safetyPercentage >= 80) return 'Muito Seguro';
  if (safetyPercentage >= 60) return 'Moderadamente Seguro';
  if (safetyPercentage >= 40) return 'Pouco Seguro';
  return 'Perigoso';
};
