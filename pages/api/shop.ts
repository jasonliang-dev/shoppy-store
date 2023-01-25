import type { NextApiRequest, NextApiResponse } from 'next'
import { graphql } from '@/common/shopify'
import { Collection } from '@/common/interfaces'

type Data = any

export default async function handler(_: NextApiRequest, res: NextApiResponse<Data>) {
  const { data } = await graphql(`
    query {
      shop {
        id
        name
      }
      collections(first: 250) {
        edges {
          node {
            id
            title
            descriptionHtml
            handle
          }
        }
      }
    }
  `)

  const collections = data.collections.edges
    .filter(({ node }: { node: Collection }) => node.handle !== 'homepage')
    .map(({ node }: { node: Collection }) => node)

  res.status(200).json({
    collections,
    shop: data.shop,
  })
}
