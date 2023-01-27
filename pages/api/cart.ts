import type { NextApiRequest, NextApiResponse } from 'next'
import { client } from '@/common/shopify'
import { LineItem } from '@/common/interfaces'

type Data = any

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const id = String(req.query.id || '')

  let cart
  if (id !== '') {
    cart = await client.checkout.fetch(id)
  }

  if (!cart) {
    cart = await client.checkout.create()
  }

  cart = JSON.parse(JSON.stringify(cart))
  cart.lineItems = cart.lineItems.filter((item: LineItem) => item.variant !== null)

  res.status(200).json(cart)
}
