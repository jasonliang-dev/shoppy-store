import Client from 'shopify-buy'

export const client = Client.buildClient({
  storefrontAccessToken: process.env.STOREFRONT_ACCESS_TOKEN || "",
  domain: process.env.STORE_DOMAIN || "",
});
