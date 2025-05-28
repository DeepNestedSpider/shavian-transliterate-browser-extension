// Dictionary exports
// Only readlex dictionary is used in the application

import { readlexDict } from './readlex';
import { namesDict } from './names';

export { readlexDict, namesDict };

export type DictionaryName = 'readlex';

export const dictionaries = {
  readlex: readlexDict,
} as const;
