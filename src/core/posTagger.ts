// POS tagger using wordpos package for better accuracy
const WordPOS = require('wordpos');

export interface POSTaggedToken {
  text: string;
  pos: string;
}

// Initialize WordPOS instance
const wordpos = new WordPOS();

// Cache for POS results to improve performance
const posCache = new Map<string, string>();

export async function posTagSentence(sentence: string): Promise<POSTaggedToken[]> {
  // Split sentence into words while preserving whitespace and punctuation
  const tokens = sentence.split(/(\s+|[^\w\s'-])/);
  const results: POSTaggedToken[] = [];
  
  for (const token of tokens) {
    if (token.match(/^\s+$/)) {
      // Whitespace
      results.push({ text: token, pos: 'PUNCT' });
    } else if (token.match(/^[^\w\s'-]+$/)) {
      // Pure punctuation (excluding apostrophes and hyphens)
      results.push({ text: token, pos: 'PUNCT' });
    } else if (token.length > 0 && token.match(/\w/)) {
      // Word with letters
      const pos = await getPOSTag(token.toLowerCase());
      results.push({ text: token, pos });
    } else if (token.length > 0) {
      // Other content (contractions, etc.)
      results.push({ text: token, pos: 'UNC' });
    }
  }
  
  return results;
}

// Synchronous version using compromise as fallback for real-time scenarios
export function posTagSentenceSync(sentence: string): POSTaggedToken[] {
  // Import compromise for fallback
  const nlp = require('compromise');
  const doc = nlp(sentence);
  const terms = doc.terms().json();
  
  return terms.map((term: any) => ({
    text: term.text,
    pos: mapCompromiseTagToReadlex(term.tags || []),
  }));
}

async function getPOSTag(word: string): Promise<string> {
  // Check cache first
  if (posCache.has(word)) {
    return posCache.get(word)!;
  }
  
  try {
    // Use wordpos to determine POS
    const isNoun = await wordpos.isNoun(word);
    const isVerb = await wordpos.isVerb(word);
    const isAdjective = await wordpos.isAdjective(word);
    const isAdverb = await wordpos.isAdverb(word);
    
    let pos = 'UNC'; // Default unknown
    
    if (isNoun) {
      // Check if plural
      if (word.endsWith('s') && word.length > 1) {
        const singular = word.slice(0, -1);
        const isSingularNoun = await wordpos.isNoun(singular);
        pos = isSingularNoun ? 'NN2' : 'NN1';
      } else {
        pos = 'NN1';
      }
    } else if (isVerb) {
      // Determine verb form
      if (word.endsWith('ing')) {
        pos = 'VVG';
      } else if (word.endsWith('ed')) {
        pos = 'VVD';
      } else if (word.endsWith('s') && word.length > 1) {
        pos = 'VVZ';
      } else {
        pos = 'VVI';
      }
    } else if (isAdjective) {
      pos = 'AJ0';
    } else if (isAdverb) {
      pos = 'AV0';
    }
    
    // Cache the result
    posCache.set(word, pos);
    return pos;
    
  } catch (error) {
    console.warn('WordPOS error for word:', word, error);
    // Fallback to heuristic mapping
    const fallbackPos = getHeuristicPOS(word);
    posCache.set(word, fallbackPos);
    return fallbackPos;
  }
}

// Heuristic POS detection as fallback
function getHeuristicPOS(word: string): string {
  // Common function words
  const functionWords: Record<string, string> = {
    'the': 'AT0', 'a': 'AT0', 'an': 'AT0',
    'and': 'CJC', 'or': 'CJC', 'but': 'CJC',
    'of': 'PRF', 'in': 'PRP', 'on': 'PRP', 'at': 'PRP', 'to': 'PRP',
    'is': 'VBZ', 'are': 'VBR', 'was': 'VBD', 'were': 'VBD',
    'have': 'VHI', 'has': 'VHZ', 'had': 'VHD',
    'will': 'VM0', 'would': 'VM0', 'can': 'VM0', 'could': 'VM0',
    'not': 'XX0', 'no': 'AT0',
    'this': 'DT0', 'that': 'DT0', 'these': 'DT0', 'those': 'DT0',
    'I': 'PNP', 'you': 'PNP', 'he': 'PNP', 'she': 'PNP', 'it': 'PNP',
    'we': 'PNP', 'they': 'PNP', 'me': 'PNP', 'him': 'PNP', 'her': 'PNP',
    'us': 'PNP', 'them': 'PNP'
  };
  
  if (functionWords[word.toLowerCase()]) {
    return functionWords[word.toLowerCase()]!;
  }
  
  // Simple suffix-based heuristics
  if (word.endsWith('ly')) return 'AV0'; // adverb
  if (word.endsWith('ing')) return 'VVG'; // gerund/present participle
  if (word.endsWith('ed')) return 'VVD'; // past participle
  if (word.endsWith('er') || word.endsWith('est')) return 'AJ0'; // comparative/superlative
  if (word.endsWith('tion') || word.endsWith('sion')) return 'NN1'; // noun
  if (word.endsWith('s') && word.length > 1) return 'NN2'; // plural noun (heuristic)
  
  return 'UNC'; // unknown
}

// Map compromise tags to Readlex POS tags for fallback
function mapCompromiseTagToReadlex(tags: string[]): string {
  if (!tags || !Array.isArray(tags)) {
    return 'UNC';
  }
  
  if (tags.includes('Verb')) {
    if (tags.includes('Gerund')) return 'VVG';
    if (tags.includes('PastTense')) return 'VVD';
    if (tags.includes('PresentTense')) return 'VVZ';
    return 'VVI';
  }
  if (tags.includes('Noun')) {
    if (tags.includes('Plural')) return 'NN2';
    return 'NN1';
  }
  if (tags.includes('Adjective')) return 'AJ0';
  if (tags.includes('Adverb')) return 'AV0';
  if (tags.includes('Determiner')) return 'AT0';
  if (tags.includes('Preposition')) return 'PRP';
  if (tags.includes('Pronoun')) return 'PNP';
  if (tags.includes('Conjunction')) return 'CJC';
  if (tags.includes('Modal')) return 'VM0';
  
  return 'UNC';
}
