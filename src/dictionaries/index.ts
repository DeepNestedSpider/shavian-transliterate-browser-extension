// Dictionary exports
// Available dictionaries: readlex (Shavian), ipa (IPA pronunciation)

import { readlexDict } from './readlex';
import { namesDict } from './names';
import { ipaDictionary } from './ipa';

export { readlexDict, namesDict, ipaDictionary };

export type DictionaryName = 'readlex' | 'ipa';

export const dictionaries = {
  readlex: readlexDict,
  ipa: ipaDictionary,
} as const;
