import { describe, expect, it } from 'vitest'; import { normalizeUrl } from './url-extractor.service.js';
describe('normalizeUrl',()=>{it('removes tracking parameters and fragments',()=>expect(normalizeUrl('https://example.com/path?utm_source=x&keep=yes#heading')).toBe('https://example.com/path?keep=yes'))});
