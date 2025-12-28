import { Extension } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { php } from "@codemirror/lang-php";
import { csharp } from "@replit/codemirror-lang-csharp";
import { html } from "@codemirror/lang-html";
import { autocompletion } from "@codemirror/autocomplete";

/**
 * Kiểm tra xem ngôn ngữ có được hỗ trợ highlight không
 */
export function isLanguageSupported(languageName: string): boolean {
  const name = languageName.toLowerCase();
  return (
    name.includes("javascript") ||
    name.includes("python") ||
    name.includes("c++") ||
    name.includes("cpp") ||
    name === "c" ||
    name.includes("c (gcc") ||
    name.includes("java") ||
    name.includes("php") ||
    name.includes("c#") ||
    name.includes("html")
  );
}

/**
 * Lấy CodeMirror language extension dựa trên tên ngôn ngữ từ Judge0 API.
 * Bao gồm cả tính năng gợi ý code tự động khi gõ (autocompletion).
 */
export function getLanguageExtensionByName(languageName: string): Extension[] {
  const name = languageName.toLowerCase();

  // Cấu hình gợi ý code để tự động bật lên khi gõ
  const baseExtensions = [autocompletion({ activateOnTyping: true })];

  // Các gói ngôn ngữ tự động cung cấp nguồn gợi ý cho từ khóa và cú pháp
  if (name.includes("javascript"))
    return [...baseExtensions, javascript({ jsx: true })];
  if (name.includes("python")) return [...baseExtensions, python()];
  // Hỗ trợ C và C++ riêng biệt
  if (name.includes("c++") || name.includes("cpp"))
    return [...baseExtensions, cpp()];
  if (name === "c" || name.includes("c (gcc"))
    return [...baseExtensions, cpp()]; // C sử dụng cpp() extension vì syntax tương tự
  if (name.includes("java")) return [...baseExtensions, java()];
  if (name.includes("php")) return [...baseExtensions, php()];
  if (name.includes("c#")) return [...baseExtensions, csharp()];
  if (name.includes("html")) return [...baseExtensions, html()];

  // Nếu không có gói ngôn ngữ cụ thể, vẫn trả về autocompletion cơ bản
  return baseExtensions;
}
