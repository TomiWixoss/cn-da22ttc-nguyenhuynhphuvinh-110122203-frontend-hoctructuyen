"use client";

import React, { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import { useTheme } from "next-themes";
import { Extension } from "@codemirror/state";
import { EditorView, Decoration, gutter, GutterMarker } from "@codemirror/view";
import { closeBrackets } from "@codemirror/autocomplete";
import { indentUnit } from "@codemirror/language";

// Inline error type
export interface InlineError {
  line: number;
  column?: number;
  message: string;
  severity: "error" | "warning" | "note";
  suggestion?: string;
}

// Error marker for gutter
class ErrorMarker extends GutterMarker {
  constructor(private severity: "error" | "warning") {
    super();
  }
  toDOM() {
    const marker = document.createElement("div");
    marker.className = `error-marker ${this.severity}`;
    marker.innerHTML = this.severity === "error" ? "●" : "⚠";
    marker.style.color = this.severity === "error" ? "#ef4444" : "#f59e0b";
    marker.style.fontWeight = "bold";
    marker.style.fontSize = "12px";
    marker.style.textAlign = "center";
    return marker;
  }
}

// Create error line decoration
const errorLineDecoration = Decoration.line({
  class: "cm-error-line",
});

const warningLineDecoration = Decoration.line({
  class: "cm-warning-line",
});

interface CodeEditorProps {
  extensions: Extension[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  editable?: boolean;
  lineNumbers?: boolean;
  wordWrap?: boolean;
  fontSize?: number;
  height?: string;
  tabSize?: number;
  autoCloseBrackets?: boolean;
  inlineErrors?: InlineError[];
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  extensions,
  value,
  onChange,
  className,
  editable = true,
  lineNumbers = true,
  wordWrap = false,
  fontSize = 16,
  height = "500px",
  tabSize = 4,
  autoCloseBrackets: enableAutoCloseBrackets = true,
  inlineErrors = [],
}) => {
  const { theme } = useTheme();

  const editorTheme = useMemo(() => {
    return theme === "dark" ? githubDark : githubLight;
  }, [theme]);

  // Create error decorations based on inlineErrors
  const errorDecorations = useMemo(() => {
    if (!inlineErrors || inlineErrors.length === 0) return null;

    return EditorView.decorations.compute(["doc"], (state) => {
      const decorations: any[] = [];
      const lines = state.doc.lines;

      inlineErrors.forEach((error) => {
        if (error.line > 0 && error.line <= lines) {
          const line = state.doc.line(error.line);
          const decoration =
            error.severity === "error"
              ? errorLineDecoration
              : warningLineDecoration;
          decorations.push(decoration.range(line.from));
        }
      });

      return Decoration.set(decorations, true);
    });
  }, [inlineErrors]);

  // Error gutter
  const errorGutter = useMemo(() => {
    if (!inlineErrors || inlineErrors.length === 0) return null;

    const errorLines = new Map<number, "error" | "warning">();
    inlineErrors.forEach((error) => {
      // Map "note" to "warning" for display purposes
      const displaySeverity =
        error.severity === "note" ? "warning" : error.severity;
      if (!errorLines.has(error.line) || displaySeverity === "error") {
        errorLines.set(error.line, displaySeverity);
      }
    });

    return gutter({
      class: "cm-error-gutter",
      lineMarker: (view, line) => {
        const lineNumber = view.state.doc.lineAt(line.from).number;
        const severity = errorLines.get(lineNumber);
        if (severity) {
          return new ErrorMarker(severity);
        }
        return null;
      },
    });
  }, [inlineErrors]);

  const allExtensions = useMemo(() => {
    const exts = [...extensions];

    if (wordWrap) {
      exts.push(EditorView.lineWrapping);
    }

    if (enableAutoCloseBrackets) {
      exts.push(closeBrackets());
    }

    exts.push(indentUnit.of(" ".repeat(tabSize)));

    // Add error highlighting theme
    exts.push(
      EditorView.theme({
        ".cm-error-line": {
          backgroundColor:
            theme === "dark"
              ? "rgba(239, 68, 68, 0.15)"
              : "rgba(239, 68, 68, 0.1)",
          borderLeft: "3px solid #ef4444",
        },
        ".cm-warning-line": {
          backgroundColor:
            theme === "dark"
              ? "rgba(245, 158, 11, 0.15)"
              : "rgba(245, 158, 11, 0.1)",
          borderLeft: "3px solid #f59e0b",
        },
        ".cm-error-gutter": {
          width: "16px",
        },
      })
    );

    // Add error decorations if any
    if (errorDecorations) {
      exts.push(errorDecorations);
    }

    // Add error gutter if any
    if (errorGutter) {
      exts.push(errorGutter);
    }

    if (!editable) {
      exts.push(
        EditorView.theme({
          "&.cm-focused .cm-activeLine": { backgroundColor: "transparent" },
          "&.cm-focused .cm-activeLineGutter": {
            backgroundColor: "transparent",
          },
        })
      );
    }

    return exts;
  }, [
    extensions,
    wordWrap,
    editable,
    tabSize,
    enableAutoCloseBrackets,
    errorDecorations,
    errorGutter,
    theme,
  ]);

  return (
    <div className={className}>
      <CodeMirror
        value={value}
        height={height}
        extensions={allExtensions}
        theme={editorTheme}
        onChange={onChange}
        editable={editable}
        basicSetup={{
          highlightActiveLine: editable,
          highlightActiveLineGutter: editable,
          lineNumbers: lineNumbers,
          foldGutter: lineNumbers,
        }}
        style={{
          fontSize: `${fontSize}px`,
          borderRadius: "24px",
          border: "4px solid var(--border)",
          overflow: "hidden",
        }}
      />
    </div>
  );
};

export default CodeEditor;
