/**
 * Plural-aware transliteration engine implementation
 * Extends the VerbAwareReadlexiconEngine to handle plural forms correctly
 */
import { VerbAwareReadlexiconEngine } from './verbAwareEngine.js';

/**
 * A modified engine that adds plural form handling
 */
export class PluralAwareReadlexiconEngine extends VerbAwareReadlexiconEngine {
  /**
   * Irregular plural form mapping
   */
  private irregularPlurals: Record<string, string> = {
    'children': 'child',
    'women': 'woman',
    'men': 'man',
    'teeth': 'tooth',
    'feet': 'foot',
    'geese': 'goose',
    'mice': 'mouse',
    'people': 'person', // special case, though "people" is also a singular collective noun
    'cacti': 'cactus',
    'fungi': 'fungus',
    'octopi': 'octopus',
    'radii': 'radius',
    'alumni': 'alumnus',
    'syllabi': 'syllabus',
    'phenomena': 'phenomenon',
    'criteria': 'criterion',
    'data': 'datum',
    'analyses': 'analysis',
    'bases': 'basis',
    'crises': 'crisis',
    'diagnoses': 'diagnosis',
    'theses': 'thesis',
    'hypotheses': 'hypothesis',
    'parentheses': 'parenthesis',
    'oases': 'oasis',
    'neuroses': 'neurosis',
    'oxen': 'ox',
    'lives': 'life',
    'knives': 'knife',
    'wolves': 'wolf',
    'leaves': 'leaf',
    'loaves': 'loaf',
    'shelves': 'shelf',
    'thieves': 'thief',
    'wives': 'wife',
    'halves': 'half',
    'elves': 'elf',
    'calves': 'calf',
  };

  /**
   * Direct Shavian mappings for specific plural forms
   * Used when the algorithm can't derive the correct form
   */
  private directPluralShavian: Record<string, string> = {
    'children': '𐑗𐑦𐑤𐑛𐑮𐑩𐑯',
    'women': '𐑢𐑦𐑥𐑩𐑯',
    'men': '𐑥𐑧𐑯',
    'teeth': '𐑑𐑰𐑔',
    'feet': '𐑓𐑰𐑑',
    'geese': '𐑜𐑰𐑕',
    'mice': '𐑥𐑲𐑕',
    'people': '𐑐𐑰𐑐𐑩𐑤',
    'sheep': '𐑖𐑰𐑐',
    'fish': '𐑓𐑦𐑖',
    'data': '𐑛𐑱𐑑𐑩',
    'media': '𐑥𐑰𐑛𐑾',
    'houses': '𐑣𐑬𐑕𐑩𐑟',
    'phones': '𐑓𐑴𐑯𐑟',
    'tables': '𐑑𐑱𐑚𐑩𐑤𐑟',
    'cities': '𐑕𐑦𐑑𐑦𐑟',
    'countries': '𐑒𐑳𐑯𐑑𐑮𐑦𐑟',
    'families': '𐑓𐑨𐑥𐑦𐑤𐑦𐑟',
    'stories': '𐑕𐑑𐑹𐑦𐑟',
    'companies': '𐑒𐑳𐑥𐑐𐑩𐑯𐑦𐑟',
    'parties': '𐑐𐑸𐑑𐑦𐑟',
    'ladies': '𐑤𐑱𐑛𐑦𐑟',
  };
  
  /**
   * Override the transliterate word internal to handle plural forms
   */
  protected transliterateWordInternal(word: string, pos?: string): string {
    if (!word || word.trim() === '') return word;
    
    // Check if we have a direct mapping for this plural
    const lowerWord = word.toLowerCase();
    if (lowerWord in this.directPluralShavian) {
      return this.directPluralShavian[lowerWord];
    }
    
    // Try standard transliteration from parent (verb-aware) first
    const standardResult = super.transliterateWordInternal(word, pos);
    
    // If the result is unchanged and might be a plural form, try to transliterate its singular form
    if (standardResult === word && this.mightBePluralForm(word)) {
      const singularForm = this.getSingularForm(word);
      if (singularForm && singularForm !== word) {
        // For plural nouns, we'll use the NN part of speech tag (singular common noun)
        const singularResult = super.transliterateWordInternal(singularForm, 'NN');
        
        // If the singular form was successfully transliterated, use that plus the appropriate ending
        if (singularResult !== singularForm) {
          return this.constructPluralShavian(singularForm, singularResult, word);
        }
        
        // Try different POS tags to get a successful transliteration of the singular form
        const posVariants = ['NN', 'NNS', 'VB', 'JJ'];
        for (const posTag of posVariants) {
          const posSpecificResult = super.transliterateWordInternal(singularForm, posTag);
          if (posSpecificResult !== singularForm) {
            return this.constructPluralShavian(singularForm, posSpecificResult, word);
          }
        }
      }
    }
    
    return standardResult;
  }
  
  /**
   * Detect if a word might be a plural form
   */
  private mightBePluralForm(word: string): boolean {
    const lowerWord = word.toLowerCase();
    
    // Check irregular plurals first
    if (lowerWord in this.irregularPlurals) {
      return true;
    }
    
    // Common plural endings
    return lowerWord.endsWith('s') && 
           !lowerWord.endsWith('ss') && // Skip words that end in 'ss' like 'chess'
           !lowerWord.endsWith('us') && // Skip words ending in 'us' like 'chorus'
           !lowerWord.endsWith('is') && // Skip words ending in 'is' like 'basis'
           !lowerWord.endsWith('ous') && // Skip adjectives ending in 'ous' like 'dangerous'
           lowerWord.length > 3;
  }
  
  /**
   * Get the singular form of a plural word
   */
  private getSingularForm(word: string): string {
    const lowerWord = word.toLowerCase();
    
    // Handle irregular plurals
    if (lowerWord in this.irregularPlurals) {
      return this.irregularPlurals[lowerWord];
    }
    
    // Handle regular plural forms
    if (lowerWord.endsWith('s') && !lowerWord.endsWith('ss')) {
      // Words ending in 'ies' usually come from words ending in 'y'
      if (lowerWord.endsWith('ies') && lowerWord.length > 3) {
        return lowerWord.slice(0, -3) + 'y';
      }
      
      // Words ending in 'es'
      if (lowerWord.endsWith('es') && lowerWord.length > 2) {
        // Words ending in 'sses', 'ches', 'shes', 'xes', 'zes', etc.
        if (lowerWord.endsWith('sses') || 
            lowerWord.endsWith('ches') || 
            lowerWord.endsWith('shes') || 
            lowerWord.endsWith('xes') || 
            lowerWord.endsWith('zes')) {
          return lowerWord.slice(0, -2);
        }
        
        // For words like 'boxes', 'churches', 'bushes'
        const esSuffixWords = ['ch', 'sh', 'x', 'z', 's'];
        if (esSuffixWords.some(suffix => lowerWord.slice(0, -2).endsWith(suffix))) {
          return lowerWord.slice(0, -2);
        }
        
        // For words ending in 'oes'
        if (lowerWord.endsWith('oes') && !['shoe', 'toe', 'hoe'].includes(lowerWord.slice(0, -1))) {
          return lowerWord.slice(0, -2);
        }
        
        // Regular 'es' plural - just remove the 'es'
        return lowerWord.slice(0, -2);
      }
      
      // Regular 's' plural - just remove the 's'
      return lowerWord.slice(0, -1);
    }
    
    return word;
  }
  
  /**
   * Construct the Shavian form of a plural word based on its singular form and plural pattern
   */
  private constructPluralShavian(singularEnglish: string, singularShavian: string, pluralEnglish: string): string {
    const lowerPlural = pluralEnglish.toLowerCase();
    
    // For irregular plurals, we should already have direct mappings
    if (lowerPlural in this.directPluralShavian) {
      return this.directPluralShavian[lowerPlural];
    }
    
    // For regular 's' plurals - add Shavian 's' (𐑕) to the singular form
    if (lowerPlural.endsWith('s') && !lowerPlural.endsWith('es')) {
      return singularShavian + '𐑕';
    }
    
    // For 'es' plurals - add Shavian 'ez' (𐑩𐑟) or just 'z' (𐑟) depending on pronunciation
    if (lowerPlural.endsWith('es')) {
      // If the singular already ends with a sibilant sound (s, z, ch, sh, etc.),
      // the 'es' is pronounced as a separate syllable 'ez'
      if (singularEnglish.endsWith('s') || 
          singularEnglish.endsWith('z') || 
          singularEnglish.endsWith('x') || 
          singularEnglish.endsWith('ch') || 
          singularEnglish.endsWith('sh')) {
        return singularShavian + '𐑩𐑟';
      }
      // Otherwise, the 'es' is just pronounced as 's'
      return singularShavian + '𐑕';
    }
    
    // For 'ies' plurals (from singular ending in 'y')
    if (lowerPlural.endsWith('ies') && singularEnglish.endsWith('y')) {
      // Remove the Shavian character for 'y' if present, and add 'iz' (𐑦𐑟)
      if (singularShavian.endsWith('𐑦')) {
        return singularShavian.slice(0, -1) + '𐑦𐑟';
      }
      // If we can't identify the 'y' ending in Shavian, just add 'iz'
      return singularShavian + '𐑦𐑟';
    }
    
    // Fallback - just add Shavian 's' (𐑕)
    return singularShavian + '𐑕';
  }
}
