import type { NextApiRequest, NextApiResponse } from 'next'
import { client } from '@/common/shopify'

type Data = any

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const id = String(req.query.id)

  let cart
  if (id) {
    cart = await client.checkout.fetch(id)
  }

  if (!cart) {
    cart = await client.checkout.create()
  }

  res.status(200).json(JSON.parse(JSON.stringify(cart)))
}
