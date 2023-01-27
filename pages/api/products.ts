import type { NextApiRequest, NextApiResponse } from 'next'
import { client, graphql } from '@/common/shopify'

type Data = any

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const num = Number(req.query.num) || 20
  const sort = String(req.query.sort || 'TITLE')
  const title = String(req.query.title || '').replace(/([:\(\)'"])/g, '\\$1')
  const collection = String(req.query.collection || '')

  if (collection === '') {
    const products = await client.product.fetchQuery({
      first: num,
      sortKey: sort,
      query: title,
      reverse: String(req.query.reverse) === 'yes',
    })
    res.status(200).json(JSON.parse(JSON.stringify(products)))
    return
  }

  // query products by collection handle
  const { data } = await graphql(`
    query ($handle: String!, $first: Int!, $sortKey: ProductCollectionSortKeys, $reverse: Boolean) {
      collection(handle: $handle) {
        products(first: $first, sortKey: $sortKey, reverse: $reverse) {
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
          edges {
            cursor
            node {
              id
              availableForSale
              descriptionHtml
              description
              handle
              productType
              title
              options {
                name
                values
              }
              images(first: 250) {
                pageInfo {
                  hasNextPage
                  hasPreviousPage
                }
                edges {
                  cursor
                  node {
                    id
                    src: url
                    altText
                    width
                    height
                  }
                }
              }
              variants(first: 250) {
                pageInfo {
                  hasNextPage
                  hasPreviousPage
                }
                edges {
                  cursor
                  node {
                    id
                    available: availableForSale
                    title
                    image {
                      id
                      src
                      altText
                      width
                      height
                    }
                    compareAtPrice {
                      amount
                      currencyCode
                    }
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `, {
    first: num,
    sortKey: sort,
    reverse: String(req.query.reverse) === 'yes',
    handle: collection,
  })

  const products = data.collection.products.edges.map(({ node }: any) => {
    return {
      ...node,
      images: node.images.edges.map(({ node }: any) => node),
      variants: node.variants.edges.map(({ node }: any) => node),
    }
  })

  res.status(200).json(JSON.parse(JSON.stringify(products)))
}
