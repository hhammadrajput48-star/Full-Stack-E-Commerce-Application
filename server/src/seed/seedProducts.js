import { readFile } from 'node:fs/promises'
import { Product } from '../models/Product.js'

const dataFile = new URL('../../data/products.json', import.meta.url)

async function loadSeedProducts() {
  const raw = JSON.parse(await readFile(dataFile, 'utf8'))
  return raw.map(({ id, ...rest }, index) => ({ _id: id, ...rest, position: index }))
}

// Wipe the products collection and load the catalogue from data/products.json.
export async function resetProducts() {
  const products = await loadSeedProducts()
  await Product.deleteMany({})
  await Product.insertMany(products)
  return products.length
}

// Load the catalogue only if the collection is empty. Runs on every server start,
// so a brand-new database (e.g. on Render) fills itself - no shell access needed.
export async function seedProductsIfEmpty() {
  if ((await Product.estimatedDocumentCount()) > 0) return 0
  return resetProducts()
}
