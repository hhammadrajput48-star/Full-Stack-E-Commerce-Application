import { products as seedData } from '../../data/products.js'
import { Product } from '../models/Product.js'

const loadSeedProducts = () => seedData.map(({ id, ...rest }, index) => ({ _id: id, ...rest, position: index }))

// Wipe the products collection and load the catalogue from data/products.js.
export async function resetProducts() {
  const products = loadSeedProducts()
  await Product.deleteMany({})
  await Product.insertMany(products)
  return products.length
}

// Load the catalogue only if the collection is empty. Runs on every server start
// (and on every serverless cold start), so a brand-new database fills itself.
export async function seedProductsIfEmpty() {
  if ((await Product.estimatedDocumentCount()) > 0) return 0
  return resetProducts()
}
