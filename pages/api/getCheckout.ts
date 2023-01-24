import type { NextApiRequest, NextApiResponse } from 'next'
import { client } from '@/common/shopify'

export type Cart = {
  id: string,
  webUrl: string,
  created: boolean,
  err?: any,
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Cart>) {
  try {
    let cart
    let created = false
    if (req.query.id) {
      cart = await client.checkout.fetch(req.query.id as string)
    } else {
      cart = await client.checkout.create()
      created = true
    }

    res.status(200).json({ id: String(cart.id), webUrl: cart.webUrl, created })
  } catch (e) {
    res.status(500).json({ id: '', webUrl: '', created: false, err: JSON.parse(JSON.stringify(e)) })
  }
}
