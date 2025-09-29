import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const secretEnv = process.env.REVALIDATE_SECRET
  const { slug, secret, path } = req.query as { slug?: string; secret?: string; path?: string }
  if (!secretEnv || secret !== secretEnv) {
    return res.status(401).json({ message: 'Invalid secret' })
  }
  try {
    if (path) {
      await res.revalidate(String(path))
      return res.json({ revalidated: true, path })
    }
    if (slug) {
      await res.revalidate(`/product/${slug}`)
      return res.json({ revalidated: true, slug })
    }
    return res.status(400).json({ message: 'Missing slug or path' })
  } catch (err: any) {
    return res.status(500).json({ message: err.message })
  }
}
