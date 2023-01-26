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
        moneyFormat
      }
      collections(first: 250) {
        edges {
          node {
            id
            title
            descriptionHtml
            handle
            image {
              id
              src: url
              altText
              width
              height
            }
          }
        }
      }
    }
  `)

  const collections = data.collections.edges.map(({ node }: { node: Collection }) => node)

  res.status(200).json({
    collections,
    shop: data.shop,
  })
}
