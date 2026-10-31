import { z } from 'zod'

const email = z
  .string({ required_error: 'Email is required.' })
  .trim()
  .toLowerCase()
  .email('Enter a valid email address.')
  .max(254)

const name = z
  .string({ required_error: 'Name is required.' })
  .trim()
  .min(1, 'Name is required.')
  .max(80, 'Name must be 80 characters or fewer.')

const phone = z.string().trim().max(30, 'Phone number is too long.').optional().default('')

export const signupSchema = z.object({
  name,
  email,
  phone,
  // bcrypt only uses the first 72 bytes, so we cap the length.
  password: z
    .string({ required_error: 'Password is required.' })
    .min(6, 'Password must be at least 6 characters.')
    .max(72, 'Password must be 72 characters or fewer.'),
})

export const loginSchema = z.object({
  email: z.string({ required_error: 'Email is required.' }).trim().toLowerCase(),
  password: z.string({ required_error: 'Password is required.' }).min(1, 'Password is required.'),
})

export const profileSchema = z.object({ name, email, phone })

export const addCartItemSchema = z.object({
  productId: z.string({ required_error: 'productId is required.' }).min(1),
  size: z.string().nullish(),
  color: z.string().nullish(),
  qty: z.number().int('Quantity must be a whole number.').min(1).max(99).optional().default(1),
})

// qty 0 (or less) removes the line, matching the cart page's "-" button.
export const updateCartItemSchema = z.object({
  qty: z.number({ required_error: 'qty is required.' }).int('Quantity must be a whole number.').max(99),
})

export const checkoutSchema = z.object({
  promoCode: z.string().trim().max(30).optional().default(''),
})

export const newsletterSchema = z.object({ email })
