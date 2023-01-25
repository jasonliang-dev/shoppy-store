import type { NextApiRequest, NextApiResponse } from 'next'

type Data = any

export default async function handler(_: NextApiRequest, res: NextApiResponse<Data>) {
  res.status(200).json({})
}
