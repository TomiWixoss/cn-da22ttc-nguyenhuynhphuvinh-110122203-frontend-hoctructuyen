/**
 * Utility functions for displaying programming language names
 */

/**
 * Get display name for programming language
 * @param language - Language code from backend (c, cpp, c++, javascript, python, etc.)
 * @returns Human-readable language name
 */
export function getLanguageDisplayName(language: string): string {
  const languageMap: Record<string, string> = {
    c: "C (gcc)",
    cpp: "C++",
    "c++": "C++",
    javascript: "JavaScript",
    python: "Python",
    java: "Java",
    php: "PHP",
    "c#": "C#",
    csharp: "C#",
    html: "HTML",
  };

  const lowerLang = language.toLowerCase();
  return languageMap[lowerLang] || language;
}

/**
 * Get language badge color class
 * @param language - Language code
 * @returns Tailwind CSS classes for badge styling
 */
export function getLanguageBadgeColor(language: string): string {
  const lowerLang = language.toLowerCase();

  if (lowerLang === "c" || lowerLang.includes("c (gcc")) {
    return "bg-blue-500/15 text-blue-600 border-blue-500/30";
  }
  if (lowerLang === "cpp" || lowerLang === "c++") {
    return "bg-purple-500/15 text-purple-600 border-purple-500/30";
  }
  if (lowerLang === "javascript") {
    return "bg-yellow-500/15 text-yellow-600 border-yellow-500/30";
  }
  if (lowerLang === "python") {
    return "bg-green-500/15 text-green-600 border-green-500/30";
  }
  if (lowerLang === "java") {
    return "bg-orange-500/15 text-orange-600 border-orange-500/30";
  }

  // Default color
  return "bg-gray-500/15 text-gray-600 border-gray-500/30";
}
