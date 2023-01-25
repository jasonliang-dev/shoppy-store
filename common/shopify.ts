import Client from 'shopify-buy'

export const client = Client.buildClient({
  storefrontAccessToken: process.env.STOREFRONT_ACCESS_TOKEN || '',
  domain: process.env.STORE_DOMAIN || '',
});

export async function graphql(query: string, variables?: any) {
  const res = await fetch(`https://${process.env.STORE_DOMAIN}/api/2023-01/graphql`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Shopify-Storefront-Access-Token': process.env.STOREFRONT_ACCESS_TOKEN || '',
    },
    body: JSON.stringify({ query, variables })
  })

  return await res.json()
}