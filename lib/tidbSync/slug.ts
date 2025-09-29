
export function slugify(text: string): string {
  const s = (text || '').toString().normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return s || 'n-a';
}
