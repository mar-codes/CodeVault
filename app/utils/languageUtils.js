export function detectLanguage(code) {
  if (!code) return 'plaintext';

  const languagePatterns = {
    javascript: /(const|let|var|function|=>|import|export|class|extends)/,
    jsx: /(import\s+React|useState|useEffect|<[\w]+\s+|<\/[\w]+>|<[\w]+([\s\w]+=(['"]).*?\2)*\s*\/>)/,
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

  const strongIndicators = {
    jsx: ['import React', 'useState(', 'useEffect(', 'export default function', "'use client'"],
    python: ['import numpy', 'import pandas', 'def __init__'],
    javascript: ['document.getElementById', 'addEventListener', 'console.log'],
    typescript: ['interface ', 'type ', '<T>'],
    php: ['<?php'],
    html: ['<!DOCTYPE html>'],
  };

  for (const [language, indicators] of Object.entries(strongIndicators)) {
    for (const indicator of indicators) {
      if (code.includes(indicator)) {
        return language;
      }
    }
  }

  const scores = {};
  for (const [language, pattern] of Object.entries(languagePatterns)) {
    let flags = pattern.flags;
    if (!flags.includes('g')) {
      flags += 'g';
    }
    const modifiedPattern = new RegExp(pattern.source, flags);
    const matches = code.match(modifiedPattern);
    scores[language] = matches ? matches.length : 0;
  }

  if (code.includes('use client') || code.includes('import') && 
      (code.includes('useState') || code.includes('useEffect')) && 
      /<[A-Z][a-zA-Z]*/.test(code)) {
    return 'jsx';
  }

  if (scores.html > 3 && scores.javascript > 3) {
    return 'jsx';
  }

  let detectedLanguage = 'plaintext';
  let maxCount = 0;
  
  if (scores.jsx) scores.jsx *= 1.5;
  
  for (const [language, count] of Object.entries(scores)) {
    if (count > maxCount) {
      maxCount = count;
      detectedLanguage = language;
    }
  }

  return detectedLanguage;
}
