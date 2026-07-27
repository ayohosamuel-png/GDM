/**
 * Text Similarity & Duplicate Detection Utilities
 */

export function calculateTextSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/gi, '')
      .trim();

  const clean1 = normalize(str1);
  const clean2 = normalize(str2);

  if (clean1 === clean2) return 100;

  const words1 = new Set(clean1.split(/\s+/).filter((w) => w.length > 3));
  const words2 = new Set(clean2.split(/\s+/).filter((w) => w.length > 3));

  if (words1.size === 0 || words2.size === 0) return 0;

  let intersection = 0;
  words1.forEach((w) => {
    if (words2.has(w)) intersection++;
  });

  const union = new Set([...words1, ...words2]).size;
  const jaccardScore = (intersection / union) * 100;

  return Math.min(100, Math.round(jaccardScore));
}

