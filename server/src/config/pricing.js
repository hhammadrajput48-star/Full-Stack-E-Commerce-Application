// Business rules for checkout. They live on the server so the browser can never
// decide its own prices, discounts or shipping.
export const SHIPPING_FLAT = 15

// promo code (lowercase) -> discount rate
export const PROMO_CODES = {
  shopco10: 0.1,
}

export const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100
