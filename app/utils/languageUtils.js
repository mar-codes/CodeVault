export function detectLanguage(code) {
  const languagePatterns = {
    javascript: /(const|let|var|function|=>|import|export|class|extends)/,
    python: /(def|class|import|from|if __name__|print)/,
    java: /(public|private|class|void|static|extends|implements)/,
    html: /(<html|<body|<div|<p|<!DOCTYPE)/i,
    css: /(body|margin|padding|color|background|@media)/,
    sql: /(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN)/i,
    php: /(<\?php|\$_GET|\$_POST|\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*)/,
    csharp: /(using|namespace|class|public|private|void|string|int|bool)/,
    ruby: /(def|class|require|include|attr_accessor|puts)/,
    typescript: /(interface|type|enum|implements|declare|readonly)/,
  };

  for (const [language, pattern] of Object.entries(languagePatterns)) {
    if (pattern.test(code)) {
      return language;
    }
  }

  return 'plaintext';
}
