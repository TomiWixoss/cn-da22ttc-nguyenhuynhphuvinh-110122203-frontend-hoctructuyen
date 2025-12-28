export const defaultCode: Record<string, string> = {
  "c++": `// Chào mừng đến với Synlearnia Code Editor!
#include <iostream>
#include <vector>
#include <string>

int main() {
    std::vector<std::string> messages = {"Hello", "from", "C++", "14.1.0!"};
    for (const std::string& word : messages) {
        std::cout << word << " ";
    }
    std::cout << std::endl;
    return 0;
}`,
  javascript: `// Chào mừng đến với Synlearnia Code Editor!
// Sử dụng các tính năng mới nhất của Node.js
const GREETING = "Hello, Synlearnia!";
const version = process.version;

console.log(\`\${GREETING} (Running on Node.js \${version})\`);`,
  python: `# Chào mừng đến với Synlearnia Code Editor!
def greet(name="Synlearnia"):
    print(f"Hello, {name} from Python 3.13.2!")

greet()`,
  java: `// Chào mừng đến với Synlearnia Code Editor!
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Synlearnia from Java 17!");
    }
}`,
  php: `<?php
// Chào mừng đến với Synlearnia Code Editor!
$message = "Hello, Synlearnia!";
$version = phpversion();
echo "$message (PHP version: $version)";
`,
  "c#": `// Chào mừng đến với Synlearnia Code Editor!
using System;
public class Program {
    public static void Main(string[] args) {
        Console.WriteLine("Hello, Synlearnia from C#!");
    }
}`,
  c: `// Chào mừng đến với Synlearnia Code Editor!
#include <stdio.h>

int main() {
   printf("Hello, Synlearnia from C!\\n");
   return 0;
}`,
};

export const findDefaultCodeKey = (languageName: string): string | null => {
  const lowerCaseName = languageName.toLowerCase();
  if (lowerCaseName.includes("javascript")) return "javascript";
  if (lowerCaseName.includes("c++")) return "c++";
  if (lowerCaseName.includes("python")) return "python";
  if (lowerCaseName.includes("java")) return "java";
  if (lowerCaseName.includes("php")) return "php";
  if (lowerCaseName.includes("c#")) return "c#";
  if (lowerCaseName.includes("c (gcc")) return "c";
  return null;
};
