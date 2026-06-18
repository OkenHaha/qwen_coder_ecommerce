import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  productId: string
  variantId: string
  name: string
  image: string
  price: number
  size?: string
  color?: string
  quantity: number
  stock: number
  slug: string
}

type CartStore = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, qty: number) => void
  clearCart: () => void
  subtotal: () => number
  itemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const qtyToAdd = item.quantity ?? 1
        const existing = get().items.find(
          (i) => i.variantId === item.variantId
        )
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.variantId === item.variantId
                ? { ...i, quantity: Math.min(i.quantity + qtyToAdd, i.stock) }
                : i
            ),
          })
        } else {
          // Remove custom quantity field from the final item if needed, but it matches CartItem once quantity is set.
          const { quantity, ...itemWithoutQty } = item;
          set({ items: [...get().items, { ...itemWithoutQty, quantity: qtyToAdd }] })
        }
      },

      removeItem: (variantId) =>
        set({ items: get().items.filter((i) => i.variantId !== variantId) }),

      updateQuantity: (variantId, qty) =>
        set({
          items: get().items.map((i) =>
            i.variantId === variantId
              ? { ...i, quantity: Math.min(Math.max(1, qty), i.stock) }
              : i
          ),
        }),

      clearCart: () => set({ items: [] }),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      itemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'cart-storage' } // persisted to localStorage
  )
)