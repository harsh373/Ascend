export const getRank = (level: number) => {
  if (level >= 50) return "S";
  if (level >= 30) return "A";
  if (level >= 20) return "B";
  if (level >= 10) return "C";
  return "D";
};
