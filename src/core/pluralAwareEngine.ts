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
    // Common plural forms that need special handling
    'houses': '𐑣𐑬𐑕𐑩𐑟',
    'phones': '𐑓𐑴𐑯𐑟',
    'tables': '𐑑𐑱𐑚𐑩𐑤𐑟',
    'pictures': '𐑐𐑦𐑒𐑗𐑼𐑟',
    'offices': '𐑪𐑓𐑦𐑕𐑩𐑟',
    'churches': '𐑗𐑻𐑗𐑩𐑟',
    'beaches': '𐑚𐑰𐑗𐑩𐑟',
    'faces': '𐑓𐑱𐑕𐑩𐑟',
    'pages': '𐑐𐑱𐑡𐑩𐑟',
    'windows': '𐑢𐑦𐑯𐑛𐑴𐑟',
    'addresses': '𐑩𐑛𐑮𐑧𐑕𐑩𐑟',
    'buses': '𐑚𐑳𐑕𐑩𐑟',
    'classes': '𐑒𐑤𐑭𐑕𐑩𐑟',
    'foxes': '𐑓𐑪𐑒𐑕𐑩𐑟',
    // Words ending in 'y' -> 'ies'
    'cities': '𐑕𐑦𐑑𐑦𐑟',
    'countries': '𐑒𐑳𐑯𐑑𐑮𐑦𐑟',
    'families': '𐑓𐑨𐑥𐑦𐑤𐑦𐑟',
    'stories': '𐑕𐑑𐑹𐑦𐑟',
    'companies': '𐑒𐑳𐑥𐑐𐑩𐑯𐑦𐑟',
    'parties': '𐑐𐑸𐑑𐑦𐑟',
    'ladies': '𐑤𐑱𐑛𐑦𐑟',
    'flies': '𐑓𐑤𐑲𐑟',
    'replies': '𐑮𐑦𐑐𐑤𐑲𐑟',
    'babies': '𐑚𐑱𐑚𐑦𐑟',
    // Words ending in 'f/fe' -> 'ves'
    'leaves': '𐑤𐑰𐑝𐑟',
    'knives': '𐑯𐑲𐑝𐑟',
    'wives': '𐑢𐑲𐑝𐑟',
    'lives': '𐑤𐑲𐑝𐑟',
    'halves': '𐑣𐑭𐑝𐑟',
    'shelves': '𐑖𐑧𐑤𐑝𐑟',
    'wolves': '𐑢𐑫𐑤𐑝𐑟',
    'elves': '𐑧𐑤𐑝𐑟',
    'thieves': '𐑔𐑰𐑝𐑟',
    'calves': '𐑒𐑭𐑝𐑟',
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
        
        // For words like "house" -> "houses", try to get the singular form transliteration
        const singularLower = singularForm.toLowerCase();
        
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
      return this.irregularPlurals[lowerWord] || word;
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
        
        // For words ending in 'ves' (irregular plurals like leaves, knives)
        if (lowerWord.endsWith('ves')) {
          // Check if this is in our irregular plurals list first
          if (lowerWord in this.irregularPlurals) {
            return this.irregularPlurals[lowerWord] || word;
          }
          // Otherwise try a generic conversion from 'ves' to 'f'
          return lowerWord.slice(0, -3) + 'f';
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
      return this.directPluralShavian[lowerPlural] || singularShavian + '𐑕';
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
    
    // For 'ves' plurals (from singular ending in 'f' or 'fe')
    if (lowerPlural.endsWith('ves') && 
       (singularEnglish.endsWith('f') || singularEnglish.endsWith('fe'))) {
      // Replace the final 'f' or 'fe' sound with 'v' and add 'z'
      if (singularShavian.endsWith('𐑓')) {
        return singularShavian.slice(0, -1) + '𐑝𐑟';
      }
      // If we can't identify the 'f' ending in Shavian, just add 'vz'
      return singularShavian + '𐑝𐑟';
    }
    
    // Fallback - just add Shavian 's' (𐑕)
    return singularShavian + '𐑕';
  }
}
