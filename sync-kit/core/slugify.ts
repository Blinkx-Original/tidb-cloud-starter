/**
 * A very simple slugification function. It lowercases the input,
 * replaces runs of non‑alphanumeric characters with a single dash and trims
 * leading/trailing dashes. This mirrors the behaviour used in the WordPress plugin.
 */
export function slugify(value: any): string {
  const s = String(value || '')
    .toLowerCase()
    .trim();
  return s
    .replace(/[_\s]+/g, '-') // underscores and spaces to hyphen
    .replace(/[^a-z0-9-]/g, '') // drop any other non alphanumerics
    .replace(/--+/g, '-') // collapse consecutive dashes
    .replace(/^-+|-+$/g, ''); // trim leading/trailing dashes
}