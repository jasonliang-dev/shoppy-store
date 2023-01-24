import type { NextApiRequest, NextApiResponse } from 'next'
import { client } from '@/common/shopify'

type Data = {
  id: string
}

export default async function handler(_: NextApiRequest, res: NextApiResponse<Data>) {
  const cart = await client.checkout.create()
  res.status(200).json({ id: String(cart.id) })
}
