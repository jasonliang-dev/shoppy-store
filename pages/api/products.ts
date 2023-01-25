import type { NextApiRequest, NextApiResponse } from 'next'
import { client } from '@/common/shopify'

type Data = any

// sort key:
// https://shopify.dev/api/storefront/2023-01/enums/productsortkeys

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const num = Number(req.query.num) || 20
  const sort = String(req.query.sort || 'TITLE')
  const title = String(req.query.title || '').replace(/([:\(\)'"])/g, '\\$1')

  const products = await client.product.fetchQuery({
    first: num,
    sortKey: sort,
    query: title,
    reverse: String(req.query.reverse) === 'yes',
  })

  res.status(200).json(JSON.parse(JSON.stringify(products)))
}
