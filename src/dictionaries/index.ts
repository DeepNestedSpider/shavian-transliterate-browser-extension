// Dictionary exports
// Only readlex dictionary is used in the application

import { readlexDict } from './readlex';

export { readlexDict };

export type DictionaryName = 'readlex';

export const dictionaries = {
  readlex: readlexDict,
} as const;
