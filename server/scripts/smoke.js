// End-to-end check of the whole API.
//   Local:     npm run smoke
//   Deployed:  API_URL=https://your-api.onrender.com npm run smoke
// Needs the server to be running. Creates one throw-away test user.

const API = (process.env.API_URL || 'http://localhost:5000').replace(/\/+$/, '')
let passed = 0
let failed = 0

async function call(method, path, { body, token } = {}) {
  const res = await fetch(`${API}/api${path}`, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => null)
  return { status: res.status, data }
}

function check(name, condition, extra = '') {
  if (condition) {
    passed += 1
    console.log(`  ✓ ${name}`)
  } else {
    failed += 1
    console.log(`  ✗ ${name} ${extra}`)
  }
}

const email = `smoke+${Date.now()}@example.com`
const password = 'secret123'
let r

console.log(`Testing ${API}\n`)

console.log('Health & products')
r = await call('GET', '/health')
check('GET /health -> 200', r.status === 200)
r = await call('GET', '/products')
check('GET /products returns the catalogue', r.status === 200 && r.data.products.length >= 14, JSON.stringify(r.data)?.slice(0, 120))
check('products have an "id" and no "_id"', r.data.products[0].id && !('_id' in r.data.products[0]))
r = await call('GET', '/products?style=gym&sort=price-asc')
check('filter by style + sort works', r.data.products.length > 0 && r.data.products.every((p) => p.style === 'gym'))
r = await call('GET', '/products?sale=true')
check('sale filter only returns discounted items', r.data.products.length > 0 && r.data.products.every((p) => p.oldPrice))
r = await call('GET', '/products/skinny-fit-jeans')
check('GET /products/:id', r.status === 200 && r.data.product.id === 'skinny-fit-jeans')
r = await call('GET', '/products/does-not-exist')
check('unknown product -> 404', r.status === 404)

console.log('\nAuth')
r = await call('POST', '/auth/signup', { body: { name: 'Smoke Tester', email, phone: '+92 300 0000000', password } })
check('signup -> 201', r.status === 201 && r.data.user.email === email, JSON.stringify(r.data))
check('signup never returns the password', !JSON.stringify(r.data).includes('password'))
r = await call('POST', '/auth/signup', { body: { name: 'Dup', email, password } })
check('duplicate email -> 409', r.status === 409)
r = await call('POST', '/auth/signup', { body: { name: 'Short', email: 'x@example.com', password: '123' } })
check('short password -> 400', r.status === 400 && /6 characters/.test(r.data.message), r.data?.message)
r = await call('POST', '/auth/login', { body: { email, password: 'wrong-password' } })
check('wrong password -> 401', r.status === 401)
r = await call('POST', '/auth/login', { body: { email: email.toUpperCase(), password } })
check('login (case-insensitive email) -> token', r.status === 200 && typeof r.data.token === 'string')
const token = r.data.token
r = await call('GET', '/auth/me')
check('/auth/me without token -> 401', r.status === 401)
r = await call('GET', '/auth/me', { token })
check('/auth/me with token', r.status === 200 && r.data.user.email === email && r.data.user.joinedAt)
r = await call('PATCH', '/auth/me', { token, body: { name: 'Smoke Renamed', email, phone: '123' } })
check('update profile', r.status === 200 && r.data.user.name === 'Smoke Renamed' && r.data.user.phone === '123', JSON.stringify(r.data))

console.log('\nCart')
r = await call('GET', '/cart')
check('cart requires login -> 401', r.status === 401)
r = await call('GET', '/cart', { token })
check('new cart is empty', r.status === 200 && r.data.items.length === 0)
r = await call('POST', '/cart/items', { token, body: { productId: 'skinny-fit-jeans' } })
check('add with defaults (first size/colour)', r.status === 200 && r.data.items.length === 1 && r.data.items[0].qty === 1 && r.data.items[0].size === '28', JSON.stringify(r.data))
r = await call('POST', '/cart/items', { token, body: { productId: 'skinny-fit-jeans', qty: 2 } })
check('adding same line again increases qty', r.data.items.length === 1 && r.data.items[0].qty === 3)
r = await call('POST', '/cart/items', { token, body: { productId: 'skinny-fit-jeans', size: '34', color: '#1c1c1c', qty: 1 } })
check('different size/colour = new line', r.data.items.length === 2)
r = await call('POST', '/cart/items', { token, body: { productId: 'skinny-fit-jeans', size: 'XXXL' } })
check('invalid size -> 400', r.status === 400)
r = await call('POST', '/cart/items', { token, body: { productId: 'nope' } })
check('unknown product -> 404', r.status === 404)
r = await call('POST', '/cart/items', { token, body: { productId: 'skinny-fit-jeans', price: 1 } })
check('client-sent price is ignored', r.status === 200 && r.data.items.every((i) => i.price === 240))
const hashLine = r.data.items.find((i) => i.color === '#1c1c1c')
r = await call('PATCH', `/cart/items/${encodeURIComponent(hashLine.lineId)}`, { token, body: { qty: 5 } })
check('PATCH qty (lineId containing "#")', r.status === 200 && r.data.items.find((i) => i.lineId === hashLine.lineId).qty === 5, JSON.stringify(r.data))
r = await call('PATCH', `/cart/items/${encodeURIComponent(hashLine.lineId)}`, { token, body: { qty: 0 } })
check('qty 0 removes the line', r.data.items.length === 1)
r = await call('DELETE', `/cart/items/${encodeURIComponent(r.data.items[0].lineId)}`, { token })
check('DELETE line', r.status === 200 && r.data.items.length === 0)

console.log('\nWishlist')
r = await call('PUT', '/wishlist/joggers-fleece', { token })
check('add to wishlist', r.status === 200 && r.data.wishlist.includes('joggers-fleece'))
r = await call('PUT', '/wishlist/joggers-fleece', { token })
check('adding twice does not duplicate', r.data.wishlist.length === 1)
r = await call('PUT', '/wishlist/nope', { token })
check('unknown product -> 404', r.status === 404)
r = await call('GET', '/wishlist', { token })
check('GET wishlist', r.data.wishlist.length === 1)
r = await call('DELETE', '/wishlist/joggers-fleece', { token })
check('remove from wishlist', r.status === 200 && r.data.wishlist.length === 0)

console.log('\nOrders / checkout')
r = await call('POST', '/orders', { token, body: {} })
check('checkout with empty cart -> 400', r.status === 400)
await call('POST', '/cart/items', { token, body: { productId: 'tshirt-tape-details', qty: 2 } }) // 2 x 120
await call('POST', '/cart/items', { token, body: { productId: 'skinny-fit-jeans' } }) // 240
r = await call('POST', '/orders', { token, body: { promoCode: 'BADCODE' } })
check('invalid promo -> 400', r.status === 400)
r = await call('POST', '/orders', { token, body: { promoCode: 'SHOPCO10' } })
// subtotal 480, discount 48, shipping 15 => 447
check('order totals computed on server (480 - 48 + 15 = 447)', r.status === 201 && r.data.order.subtotal === 480 && r.data.order.discount === 48 && r.data.order.shipping === 15 && r.data.order.total === 447, JSON.stringify(r.data))
const orderId = r.data.order?.id
r = await call('GET', '/cart', { token })
check('cart is emptied after checkout', r.data.items.length === 0)
r = await call('GET', '/orders', { token })
check('order history lists the order', r.data.orders.length === 1 && r.data.orders[0].id === orderId)
r = await call('GET', `/orders/${orderId}`, { token })
check('GET order by id', r.status === 200 && r.data.order.items.length === 2)

console.log('\nNewsletter')
r = await call('POST', '/newsletter', { body: { email: 'not-an-email' } })
check('invalid email -> 400', r.status === 400)
r = await call('POST', '/newsletter', { body: { email } })
check('subscribe -> 201', r.status === 201)
r = await call('POST', '/newsletter', { body: { email } })
check('subscribe twice is fine', r.status === 201)

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)
