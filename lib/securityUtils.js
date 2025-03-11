const PROFANITY_LIST = [
  'ass', 'asshole', 'bastard', 'bitch', 'bollocks', 'bullshit', 
  'cock', 'crap', 'cunt', 'damn', 'dick', 'douche', 'dumbass',
  'fag', 'faggot', 'fuck', 'fucking', 'jackass', 'nigga', 'nigger',
  'piss', 'porn', 'pussy', 'shit', 'slut', 'tits', 'twat', 'whore',
  'retard', 'spastic', 'Nazi', 'pedophile', 'molest'
];

const LANGUAGE_CONTEXTS = {
  javascript: {
    safeContexts: [
      /\/\/\s*example|\/\*\s*example/i,
      /\/\/\s*tutorial|\/\*\s*tutorial/i,
      /\/\/\s*for\s+educational\s+purposes/i,
      /\/\/\s*this\s+shows\s+how/i,
      /\/\*\s*demonstration\s+of/i
    ],
    riskPatterns: [
      /new\s+Function\s*\(\s*["']/i,
      /\bwindow\s*\[\s*["'].*["']\s*\]/i
    ]
  },
  python: {
    safeContexts: [
      /#\s*example/i,
      /#\s*tutorial/i,
      /""".*example.*"""/is,
      /'''.*demonstration.*'''/is
    ],
    riskPatterns: [
      /\bexec\s*\(/i,
      /\bcompile\s*\(/i,
      /\b__import__\s*\(/i
    ]
  },
};

const WHITELIST_PATTERNS = [
  /fetch\s*\(\s*['"]https:\/\/api\.example\.com/i,
  /fetch\s*\(\s*['"]https:\/\/jsonplaceholder\.typicode\.com/i,
  /\.ajax\s*\(\s*\{\s*url:\s*['"](https:\/\/|\/)/i,
  /localStorage\.setItem\s*\(\s*['"]example/i,
  /localStorage\.getItem\s*\(\s*['"]example/i,
  /document\.cookie\s*=\s*['"]example/i,
  /['"]SELECT\s+.*\s+FROM\s+users\s+WHERE/i
];

const MALICIOUS_PATTERNS = [
  { pattern: /(?:exec|spawn|shell_exec|system|passthru)\s*\(\s*(?!['"]echo['"])/i, score: 9, category: 'command-execution' },
  { pattern: /(?:eval)\s*\(\s*[\w\s]*(?:req\.body|req\.query|req\.params|req\.headers)/i, score: 10, category: 'dynamic-execution' },
  { pattern: /<script[\s\S]*?>([\s\S]*?)<\/script>/i, score: 6, category: 'script-injection', context: 'html' },
  { pattern: /document\.write\s*\(\s*(?:.*[+])?.*(?:location|document\.URL|document\.cookie)/i, score: 7, category: 'script-injection' },
  { pattern: /document\.cookie\s*=/i, score: 4, category: 'cookie-manipulation' },
  { pattern: /localStorage\.\w+\s*=\s*.+/i, score: 4, category: 'storage-manipulation' },
  { pattern: /sessionStorage\.\w+\\s*=\s*.+/i, score: 4, category: 'storage-manipulation' },
  { pattern: /(?:SELECT|INSERT|UPDATE|DELETE|DROP|ALTER)\s+.*?(?:FROM|INTO|TABLE)/i, score: 5, category: 'sql-pattern', context: 'non-comment' },
  { pattern: /\bUNION\s+(?:ALL\s+)?SELECT\b/i, score: 6, category: 'sql-injection' },
  { pattern: /(?:unlink|rmdir|chmod|mkdir|file_get_contents|file_put_contents)\s*\(/i, score: 6, category: 'file-operation' },
  { pattern: /new\s+XMLHttpRequest/i, score: 3, category: 'network-request' },
  { pattern: /fetch\s*\(\s*(?!['"]https:\/\/|['"]\/)/i, score: 4, category: 'network-request' },
  { pattern: /\.ajax\s*\(/i, score: 3, category: 'network-request' },
  { pattern: /atob\s*\(\s*['"].{30,}/i, score: 5, category: 'obfuscation' },
  { pattern: /base64_decode\s*\(\s*['"].{30,}/i, score: 5, category: 'obfuscation' },
  { pattern: /String\.fromCharCode\s*\(\s*(?:\d+\s*,\s*){5,}/i, score: 6, category: 'obfuscation' },
  { pattern: /eval\s*\(\s*(?!['"]console\.log)/i, score: 7, category: 'dynamic-execution' }
];

const RISK_THRESHOLD = {
  low: 3,
  medium: 6,
  high: 8
};

export function containsProfanity(text) {
  if (!text || typeof text !== 'string') return false;
  
  const normalizedText = text.toLowerCase();
  
  return PROFANITY_LIST.some(word => 
    normalizedText.includes(word.toLowerCase())
  );
}

function isEducationalContext(code, language) {
  if (!code || !language) return false;
  
  const educationalMarkers = [
    /\/\/\s*example/i,
    /\/\*\s*example/i,
    /#\s*example/i,
    /<!--\s*example/i,
    /example\s+code/i,
    /tutorial\s+code/i,
    /for\s+educational\s+purposes/i
  ];

  if (educationalMarkers.some(marker => marker.test(code))) {
    return true;
  }

  const langContext = LANGUAGE_CONTEXTS[language.toLowerCase()];
  if (langContext && langContext.safeContexts) {
    return langContext.safeContexts.some(pattern => pattern.test(code));
  }

  return false;
}

function isWhitelisted(code, pattern) {
  return WHITELIST_PATTERNS.some(wlPattern => {
    if (wlPattern.toString() === pattern.toString()) {
      return true;
    }
    
    const patternStr = pattern.toString().replace(/^\/|\/[gi]*$/g, '');
    const whitelistStr = wlPattern.toString().replace(/^\/|\/[gi]*$/g, '');
    
    return patternStr.includes(whitelistStr) || whitelistStr.includes(patternStr);
  });
}

export function scanForMaliciousCode(code, language = 'plaintext') {
  if (!code || typeof code !== 'string') {
    return { isSafe: true, riskScore: 0, matches: [], risks: [] };
  }
  
  let totalScore = 0;
  const matches = [];
  const risks = [];
  const isEducational = isEducationalContext(code, language);
  
  const langPatterns = [];
  if (LANGUAGE_CONTEXTS[language?.toLowerCase()]) {
    langPatterns.push(...LANGUAGE_CONTEXTS[language.toLowerCase()].riskPatterns || []);
  }
  
  for (const { pattern, score, category } of [...MALICIOUS_PATTERNS, ...langPatterns.map(p => ({ pattern: p, score: 5, category: 'lang-specific' }))]) {
    if (pattern.test(code)) {
      if (isWhitelisted(code, pattern)) {
        continue;
      }
      
      let adjustedScore = score;
      if (isEducational) {
        adjustedScore = Math.max(1, score - 3);
      }
      
      const match = {
        pattern: pattern.toString().replace(/^\/|\/[gi]*$/g, ''),
        category,
        score: adjustedScore
      };
      
      matches.push(match.pattern);
      risks.push(match);
      totalScore += adjustedScore;
    }
  }
  
  let riskLevel = 'safe';
  if (totalScore >= RISK_THRESHOLD.high) {
    riskLevel = 'high';
  } else if (totalScore >= RISK_THRESHOLD.medium) {
    riskLevel = 'medium';
  } else if (totalScore >= RISK_THRESHOLD.low) {
    riskLevel = 'low';
  }
  
  return {
    isSafe: totalScore < RISK_THRESHOLD.medium,
    riskScore: totalScore,
    riskLevel,
    matches,
    risks
  };
}

export function performSecurityCheck(creation) {
  const { title, description, code, language = 'plaintext' } = creation;
  
  const titleHasProfanity = containsProfanity(title);
  const descriptionHasProfanity = containsProfanity(description);
  
  const codeSecurityScan = scanForMaliciousCode(code, language);
  
  const isProfanityFree = !titleHasProfanity && !descriptionHasProfanity;
  const isCodeSafe = codeSecurityScan.isSafe;
  
  return {
    isSecure: isProfanityFree && isCodeSafe,
    hasProfanity: !isProfanityFree,
    profanityDetails: {
      titleHasProfanity,
      descriptionHasProfanity
    },
    malwareDetails: codeSecurityScan,
    allowOverride: codeSecurityScan.riskLevel !== 'high'
  };
}
