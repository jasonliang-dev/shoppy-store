import type { NextApiRequest, NextApiResponse } from 'next'
import { client } from '@/common/shopify'

type Data = any

export default async function handler(_: NextApiRequest, res: NextApiResponse<Data>) {
  const shop = await client.shop.fetchInfo()
  res.status(200).json(JSON.parse(JSON.stringify(shop)))
}
