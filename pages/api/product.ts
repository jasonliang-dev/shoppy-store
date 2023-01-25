import type { NextApiRequest, NextApiResponse } from 'next'
import { client } from '@/common/shopify'

type Data = any

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const handle = String(req.query.id || '')
  const product = await client.product.fetchByHandle(handle)
  res.status(200).json(JSON.parse(JSON.stringify(product)))
}
