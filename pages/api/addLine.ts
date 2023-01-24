import type { NextApiRequest, NextApiResponse } from 'next'
import { client } from '@/common/shopify'

type Data = {
  result: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const cart = await client.checkout.addLineItems(req.body.checkout, [
    {
      variantId: req.body.variant,
      quantity: req.body.quantity,
    },
  ])
  res.status(200).json(JSON.parse(JSON.stringify(cart)))
}
