
/**
 * Retorna um emoji/ícone representando o nível de segurança.
 */
export const getSafetyIcon = (safetyPercentage: number): string => {
  if (safetyPercentage >= 80) return '🛡️';
  if (safetyPercentage >= 60) return '⚠️';
  if (safetyPercentage >= 40) return '⚡';
  return '🚨';
};
