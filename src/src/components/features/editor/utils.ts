export const getScoreColor = (score: number): string => {
  if (score >= 90) return "text-green-600 dark:text-green-400";
  if (score >= 70) return "text-blue-600 dark:text-blue-400";
  if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
};

export const getScoreBgColor = (score: number): string => {
  if (score >= 90)
    return "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800";
  if (score >= 70)
    return "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800";
  if (score >= 50)
    return "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800";
  return "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800";
};

export const cleanMarkdownCode = (code: string): string => {
  let cleanCode = code.trim();
  cleanCode = cleanCode.replace(/^```[\w+#-]*\n?/, "");
  cleanCode = cleanCode.replace(/\n?```$/, "");
  return cleanCode;
};
