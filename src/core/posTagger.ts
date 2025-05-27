// Lightweight POS tagger wrapper using compromise
import nlp from 'compromise';

export interface POSTaggedToken {
  text: string;
  pos: string;
}

export function posTagSentence(sentence: string): POSTaggedToken[] {
  const doc = nlp(sentence);
  const terms = doc.terms().json();
  return terms.map((term: any) => ({
    text: term.text,
    pos: mapCompromiseTag(term.tags),
  }));
}

// Map compromise tags to Penn Treebank-like tags for dictionary lookup
function mapCompromiseTag(tags: string[]): string {
  if (tags.includes('Verb')) return 'VB';
  if (tags.includes('Noun')) return 'NN';
  if (tags.includes('Adjective')) return 'JJ';
  if (tags.includes('Adverb')) return 'RB';
  if (tags.includes('Plural')) return 'NNS';
  // Add more mappings as needed
  return 'UNK';
}
