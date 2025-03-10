export function detectLanguage(code) {
  if (!code) return 'plaintext';

  const languagePatterns = {
    javascript: /(const|let|var|function|=>|import|export|class|extends)/,
    typescript: /(interface|type|enum|implements|declare|readonly)/,
    python: /(def|class|import|from|if __name__|print)/,
    java: /(public|private|class|void|static|extends|implements)/,
    html: /(<html|<body|<div|<p|<!DOCTYPE)/i,
    css: /(body|margin|padding|color|background|@media)/,
    sql: /(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN)/i,
    php: /(<\?php|\$_GET|\$_POST|\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*)/,
    csharp: /(using|namespace|class|public|private|void|string|int|bool)/,
    ruby: /(def|class|require|include|attr_accessor|puts)/,
    cpp: /(#include|using namespace|int main|cout|cin|void)/,
    go: /(package|import|func|type|struct|interface|map\[)/,
    swift: /(import Foundation|class|struct|var|let|func|guard)/,
  };

  for (const [language, pattern] of Object.entries(languagePatterns)) {
    if (pattern.test(code)) {
      return language;
    }
  }

  return 'plaintext';
}
