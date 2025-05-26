// This file was renamed from readlexicon-regression.test.ts
import { describe, it, expect, beforeAll } from 'bun:test';
import { TransliterationEngineFactory } from '../src/core/transliterationEngine';

const input = `Towards the end of 1962, the Cuban Missile Crisis had just ended, it was still a year-and-a-day until the first episode of Doctor Who would air, and a remarkable book was published. It was not the content of the book that was so astonishing; Bernard Shaw’s play Androcles and the Lion was fifty years old by this stage. This edition of Androcles and the Lion witnessed the birth of an entirely new alphabet, and its publication was a close-run thing. The Shaw alphabet, which came to be more commonly known by the latinised name of “Shavian”, represented the culmination of a lifetime of advocacy by Irish playwright, writer and wit, Bernard Shaw. It was perhaps the subject on which Shaw wrote most earnestly, often—but not always—casting aside his love of levity to argue on purely rational grounds about the economic inefficiencies of silent letters and absurd spellings, and the failure of traditional orthography to offer any instruction to children (or adults, for that matter) on how to speak English. G K Chesterton wrote with typical caustic wit that Shaw “found himself, led by the…mad imp of modernity, on the side of the people who want to have phonetic spelling”, and “pleasantly surprised innumerable cranks and revolutionists by finding quite rational arguments for them”.`;

const expected = `𐑑𐑩𐑢𐑹𐑛𐑟 𐑞 𐑧𐑯𐑛 𐑝 1962, 𐑞 ·𐑒𐑿𐑚𐑩𐑯 𐑥𐑦𐑕𐑲𐑤 𐑒𐑮𐑲𐑕𐑦𐑕 𐑣𐑨𐑛 𐑡𐑳𐑕𐑑 𐑧𐑯𐑛𐑩𐑛, 𐑦𐑑 𐑢𐑪𐑟 𐑕𐑑𐑦𐑤 𐑩 𐑘𐑽-𐑯-𐑩-𐑛𐑱 𐑩𐑯𐑑𐑦𐑤 𐑞 𐑓𐑻𐑕𐑑 𐑧𐑐𐑦𐑕𐑴𐑛 𐑝 ‹·𐑛𐑪𐑒𐑑𐑼 𐑣𐑵› 𐑢𐑫𐑛 𐑺, 𐑯 𐑩 𐑮𐑦𐑥𐑸𐑒𐑩𐑚𐑩𐑤 𐑚𐑫𐑒 𐑢𐑪𐑟 𐑐𐑳𐑚𐑤𐑦𐑖𐑑. 𐑦𐑑 𐑢𐑪𐑟 𐑯𐑪𐑑 𐑞 𐑒𐑪𐑯𐑑𐑧𐑯𐑑 𐑝 𐑞 𐑚𐑫𐑒 𐑞𐑨𐑑 𐑢𐑪𐑟 𐑕𐑴 𐑩𐑕𐑑𐑪𐑯𐑦𐑖𐑦𐑙; ·𐑚𐑻𐑯𐑼𐑛 𐑖𐑷𐑟 𐑐𐑤𐑱 ‹·𐑨𐑯𐑛𐑮𐑩𐑒𐑤𐑰𐑟 𐑯 𐑞 𐑤𐑲𐑩𐑯› 𐑢𐑪𐑟 𐑓𐑦𐑓𐑑𐑦 𐑘𐑽𐑟 𐑴𐑤𐑛 𐑚𐑲 𐑞𐑦𐑕 𐑕𐑑𐑱𐑡. 𐑞𐑦𐑕 𐑦𐑛𐑦𐑖𐑩𐑯 𐑝 ·𐑨𐑯𐑛𐑮𐑩𐑒𐑤𐑰𐑟 𐑯 𐑞 𐑤𐑲𐑩𐑯 𐑢𐑦𐑑𐑯𐑩𐑕𐑑 𐑞 𐑚𐑻𐑔 𐑝 𐑩𐑯 𐑦𐑯𐑑𐑲𐑼𐑤𐑦 𐑯𐑿 𐑨𐑤𐑓𐑩𐑚𐑧𐑑, 𐑯 𐑦𐑑𐑕 𐑐𐑳𐑚𐑤𐑦𐑒𐑱𐑖𐑩𐑯 𐑢𐑪𐑟 𐑩 𐑒𐑤𐑴𐑕-𐑮𐑳𐑯 𐑔𐑦𐑙.\n\n𐑞 ·𐑖𐑷 𐑨𐑤𐑓𐑩𐑚𐑧𐑑, 𐑢𐑦𐑗 𐑒𐑱𐑥 𐑑 𐑚𐑰 𐑥𐑹 𐑒𐑪𐑥𐑩𐑯𐑤𐑦 𐑯𐑴𐑯 𐑚𐑲 𐑞 𐑤𐑨𐑑𐑦𐑯𐑲𐑟𐑛 𐑯𐑱𐑥 𐑝 ·𐑖𐑱𐑝𐑾𐑯, 𐑮𐑧𐑐𐑮𐑦𐑟𐑧𐑯𐑑𐑩𐑛 𐑞 𐑒𐑳𐑤𐑥𐑦𐑯𐑱𐑖𐑩𐑯 𐑝 𐑩 𐑤𐑲𐑓𐑑𐑲𐑥 𐑝 𐑨𐑛𐑝𐑩𐑒𐑩𐑕𐑦 𐑚𐑲 𐑲𐑮𐑦𐑖 𐑐𐑤𐑱𐑮𐑲𐑑, 𐑮𐑲𐑑𐑼 𐑯 𐑢𐑦𐑑, ·𐑚𐑻𐑯𐑼𐑛 𐑖𐑷. 𐑦𐑑 𐑢𐑪𐑟 𐑐𐑼𐑣𐑨𐑑𐑕 𐑞 𐑕𐑳𐑚𐑡𐑧𐑒𐑑 𐑪𐑯 𐑢𐑦𐑗 ·𐑖𐑷 𐑮𐑴𐑑 𐑥𐑴𐑕𐑑 𐑻𐑯𐑩𐑕𐑑𐑤𐑦, 𐑪𐑯—𐑚𐑳𐑑 𐑯𐑪𐑑 𐑷𐑤𐑢𐑱𐑟—𐑒𐑭𐑕𐑑𐑦𐑙 𐑩𐑕𐑲𐑛 𐑣𐑦𐑟 𐑤𐑳𐑝 𐑝 𐑤𐑧𐑝𐑦𐑑𐑦 𐑑 𐑸𐑜𐑿 𐑪𐑯 𐑐𐑘𐑫𐑼𐑤𐑦 𐑮𐑨𐑖𐑩𐑯𐑩𐑤 𐑜𐑮𐑬𐑯𐑛𐑟 𐑩𐑚𐑬𐑑 𐑞 𐑰𐑒𐑩𐑯𐑪𐑥𐑦𐑒 𐑦𐑯𐑦𐑓𐑦𐑖𐑩𐑯𐑕𐑦𐑟 𐑝 𐑕𐑲𐑤𐑩𐑯𐑑 𐑤𐑧𐑑𐑼𐑟 𐑯 𐑩𐑚𐑕𐑻𐑛 𐑕𐑐𐑧𐑤𐑦𐑙𐑟, 𐑯 𐑞 𐑓𐑱𐑤𐑘𐑼 𐑝 𐑑𐑮𐑩𐑛𐑦𐑖𐑩𐑯𐑩𐑤 𐑹𐑔𐑪𐑜𐑮𐑩𐑓𐑦 𐑑 𐑪𐑓𐑼 𐑧𐑯𐑦 𐑦𐑯𐑕𐑑𐑮𐑳𐑒𐑖𐑩𐑯 𐑑 𐑗𐑦𐑤𐑛𐑮𐑩𐑯 (𐑹 𐑨𐑛𐑳𐑤𐑑𐑕, 𐑓 𐑞𐑨𐑑 𐑥𐑨𐑑𐑼) 𐑪𐑯 𐑣𐑬 𐑑 𐑕𐑐𐑰𐑒 𐑦𐑙𐑜𐑤𐑦𐑖. ·𐑜. 𐑒. 𐑗𐑧𐑕𐑑𐑼𐑑𐑩𐑯 𐑮𐑴𐑑 𐑢𐑦𐑞 𐑑𐑦𐑐𐑦𐑒𐑩𐑤 𐑒𐑷𐑕𐑑𐑦𐑒 𐑢𐑦𐑑 𐑞𐑨𐑑 ·𐑖𐑷 ‹𐑓𐑬𐑯𐑛 𐑣𐑦𐑥𐑕𐑧𐑤𐑓, 𐑤𐑧𐑛 𐑚𐑲 𐑞…𐑥𐑨𐑛 𐑦𐑥𐑐 𐑝 𐑥𐑩𐑛𐑻𐑯𐑦𐑑𐑦, 𐑪𐑯 𐑞 𐑕𐑲𐑛 𐑝 𐑞 𐑐𐑰𐑐𐑩𐑤 𐑣𐑵 𐑢𐑪𐑯𐑑 𐑑 𐑣𐑨𐑝 𐑓𐑩𐑯𐑧𐑑𐑦𐑒 𐑕𐑐𐑧𐑤𐑦𐑙›, 𐑯 ‹𐑐𐑤𐑧𐑟𐑩𐑯𐑑𐑤𐑦 𐑕𐑼𐑒𐑮𐑲𐑟𐑛 𐑦𐑯𐑿𐑥𐑼𐑩𐑚𐑩𐑤 𐑒𐑮𐑨𐑙𐑒𐑕 𐑯 𐑮𐑧𐑝𐑩𐑤𐑵𐑖𐑩𐑯𐑦𐑕𐑑𐑕 𐑚𐑲 𐑓𐑲𐑯𐑛𐑦𐑙 𐑒𐑢𐑲𐑑 𐑮𐑨𐑖𐑩𐑯𐑩𐑤 𐑸𐑜𐑿𐑥𐑩𐑯𐑑𐑕 𐑓 𐑞𐑧𐑥›.`;

describe('Readlexicon Engine - Shavian Transliteration', () => {
  let engine: any;

  beforeAll(async () => {
    engine = await TransliterationEngineFactory.createEngine('readlexicon');
  });

  it('should correctly transliterate the provided text sample', () => {
    const result = engine.transliterate(input);
    expect(result).toBe(expected);
  });
});
