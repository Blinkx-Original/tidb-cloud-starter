import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'text/plain');
  const host = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  res.send(`User-agent: *
Allow: /
Sitemap: ${host}/sitemap.xml
`);
}
