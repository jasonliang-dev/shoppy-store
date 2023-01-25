export type GraphQLClient = {
  query(set: GraphQLSelectionSet): GraphQLQuery,
  send(query: GraphQLQuery): Promise<any>,
}

export type GraphQLQuery = {
  toString(): string,
}

export type GraphQLSelectionSet = (builder: GraphQLSelectionSetBuilder) => void

export type GraphQLSelectionSetBuilder = {
  add(name: string, set?: GraphQLSelectionSet): void,
  addConnection(name: string, options?: { args: any, alias: string }, set?: GraphQLSelectionSet): void,
}

export type Money = {
  amount: string,
  currencyCode: string,
}

export type ProductImage = {
  id: string,
  src: string,
  altText?: string,
  width: number,
  height: number,
}

export type ProductVariant = {
  id: string,
  available: boolean,
  title: string,
  image: ProductImage,
  compareAtPrice: Money,
  price: Money,
  product: {
    id: string,
    handle: string,
  },
}

export type Product = {
  id: string,
  availableForSale: boolean,
  handle: string,
  title: string,
  description?: string,
  descriptionHtml?: string,
  options: {
    id: string,
    name: string,
    values: {
      value: string,
    }[],
  }[],
  images: ProductImage[],
  variants: ProductVariant[],
}

export type LineItem = {
  id: string,
  title: string,
  variant: ProductVariant
  quantity: number,
}

export type Cart = {
  id: string,
  lineItems: LineItem[],
  webUrl: string,
  paymentDue: Money,
  totalTax: Money,
  lineItemsSubtotalPrice: Money,
  subtotalPrice: Money,
  totalPrice: Money,
}

export type Shop = {
  id: string,
  name: string,
  moneyFormat: string,
}

export function money(m: Money, factor: number = 1) {
  const num = Number(m.amount) * factor
  return `${num.toFixed(2)} ${m.currencyCode}`
}