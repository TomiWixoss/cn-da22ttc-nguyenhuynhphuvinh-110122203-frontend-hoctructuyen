// frontend/src/lib/utils/language-utils.ts
import { Judge0Language } from "@/lib/services/api/judge0.service";

/**
 * Phân tích tên ngôn ngữ đầy đủ một cách mạnh mẽ hơn
 * Trích xuất phiên bản đầu tiên nó tìm thấy.
 * Ví dụ: "C++ (GCC 14.1.0)" => { baseName: "C++", version: "14.1.0" }
 * Ví dụ: "Java (JDK 17.0.6, OpenJFX 22.0.2)" => { baseName: "Java", version: "17.0.6" }
 */
function parseLanguageName(fullName: string): {
  baseName: string;
  version: string;
} {
  const nameMatch = fullName.match(/(.+?)\s*\((.*?)\)/);
  const baseName =
    nameMatch && nameMatch[1] ? nameMatch[1].trim() : fullName.trim();

  const versionString = nameMatch && nameMatch[2] ? nameMatch[2] : "0.0.0";
  const versionMatch = versionString.match(/(\d+(\.\d+)*)/); // Tìm chuỗi version đầu tiên
  const version = versionMatch && versionMatch[0] ? versionMatch[0] : "0.0.0";

  return { baseName, version };
}

/**
 * Hàm so sánh phiên bản mạnh mẽ hơn
 * So sánh hai chuỗi phiên bản (semantic versioning).
 * @returns > 0 nếu v1 > v2, < 0 nếu v1 < v2, 0 nếu bằng nhau.
 */
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);
  const maxLength = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < maxLength; i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;

    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

/**
 * Lọc và lấy phiên bản mới nhất của mỗi ngôn ngữ
 * @param languages - Mảng các ngôn ngữ từ Judge0 API.
 * @returns Mảng các ngôn ngữ đã được lọc.
 */
export function getLatestLanguages(
  languages: Judge0Language[]
): Judge0Language[] {
  const latestLanguages = new Map<string, Judge0Language>();

  // Loại bỏ JavaFX
  const filteredLangs = languages.filter(
    (lang) => !lang.name.toLowerCase().includes("javafx")
  );

  filteredLangs.forEach((lang) => {
    const { baseName, version } = parseLanguageName(lang.name);

    // --- THAY ĐỔI CHÍNH: KHÔNG GOM NHÓM C VÀ C++ NỮA ---
    // Giờ đây, "C" và "C++" sẽ là các key riêng biệt trong Map.
    const existingLang = latestLanguages.get(baseName);

    if (
      !existingLang ||
      compareVersions(version, parseLanguageName(existingLang.name).version) > 0
    ) {
      latestLanguages.set(baseName, lang);
    }
  });

  return Array.from(latestLanguages.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

/**
 * Chuyển đổi tên ngôn ngữ đầy đủ từ Judge0 sang từ khóa đơn giản cho backend.
 * @param fullName Tên đầy đủ, ví dụ: "JavaScript (Node.js 20.17.0)"
 * @returns Từ khóa đơn giản, ví dụ: "javascript"
 */
export function mapLanguageToKeyword(fullName: string): string {
  const lowerCaseName = fullName.toLowerCase();

  // Dựa trên danh sách backend hỗ trợ: javascript, python, java, c++, c
  if (lowerCaseName.includes("javascript")) return "javascript";
  if (lowerCaseName.includes("python")) return "python";
  if (lowerCaseName.includes("java")) return "java";
  if (lowerCaseName.includes("c++")) return "c++";
  if (lowerCaseName.includes("c (gcc")) return "c"; // Cần check cụ thể để không nhầm với C#

  // Fallback, trả về từ đầu tiên viết thường nếu không khớp
  return lowerCaseName.split(" ")[0];
}
