# E-Commerce App: Missing and Broken Pages/Components Analysis

During the analysis of the workspace and running TypeScript compilation checks, we identified several misplaced files, empty placeholder pages, missing imports, and type mismatches. 

---

## 1. Misplaced Routes
To work correctly with Next.js App Router, these directories/files must be moved into the `app/` folder so they are properly served:
* **Shop Route**: Currently, the `shop/` directory is at the root of the project (`/shop/page.tsx` and `/shop/[slug]/page.tsx`). These should be moved to:
  * `app/shop/page.tsx`
  * `app/shop/[slug]/page.tsx`
* **Checkout Route**: The checkout page is currently placed inside the components folder as `app/components/checkout/page.tsx`. It should be moved to:
  * `app/checkout/page.tsx`

---

## 2. Completely Empty Page Files (0 Bytes)
The following route files exist as empty files and need implementation:
* `app/admin/products/page.tsx` (Admin products list)
* `app/admin/orders/page.tsx` (Admin orders list)
* `app/admin/products/new/page.tsx` (Add new product page)
* `app/account/page.tsx` (Customer account profile dashboard)
* `app/account/addresses/page.tsx` (Customer addresses manager)
* `app/account/orders/page.tsx` (Customer order history list)

---

## 3. Missing Component/Hook Files
These files are imported by other active routes/components but do not exist in the codebase:
* **`app/components/header.tsx`**: (Imported in `app/layout.tsx`) — Main navigation header.
* **`app/components/footer.tsx`**: (Imported in `app/layout.tsx`) — Footer component.
* **`app/components/ui/toaster.tsx`**: (Imported in `app/layout.tsx`) — React toaster wrapper.
* **`app/admin/customers/page.tsx`**: (Linked in `app/admin/layout.tsx` sidebar) — Customers manager page.
* **`app/hooks/use-has-mounted.ts`**: (Imported in `app/cart/page.tsx`) — A hook to avoid hydration mismatches for state persisted in local storage.

---

## 4. TypeScript & Syntax Compilation Errors
We ran `npx tsc --noEmit` and resolved/identified the following bugs:

### Fixed Syntax Errors:
* **`actions/orders.ts`**: The closing bracket for a `catch` block on line 102 was commented out:
  ```typescript
  } catch { // don't fail order if email fails }
  ```
  We formatted and fixed this to prevent a syntax block error.

### Active Type/Import Mismatches:
1. **Missing Zod Imports**:
   * `app/auth/login/page.tsx` and `app/auth/signup/page.tsx` refer to `z.infer` but do not import `z` from `"zod"`.
2. **Casing Mismatch**:
   * `app/cart/page.tsx` imports `Skeleton` from `@/app/components/ui/Skeleton` (uppercase S), but the file is `skeleton.tsx` (lowercase).
3. **CartItem Type Export**:
   * `app/components/cart/CartItem.tsx` imports `CartItem` from `@/store/cart-store`, but the type is not exported in `store/cart-store.ts`.
4. **Prisma JSON Types & Razorpay typings**:
   * `actions/orders.ts` has type errors when retrieving properties (e.g., `email`, `name`) from `order.shippingAddress` because it's a Prisma Json type. Casting it to an interface or `any` is required.
   * `razorpay.orders.create` return typings need to be cast to `any` so that the `id` field can be resolved correctly.
5. **AddToCart optional variants**:
   * `app/components/shop/AddToCart.tsx` assigns `variant?.size` and `variant?.color` (which are `string | null | undefined`) directly to options that expect `string | undefined`. We should use `?? undefined` fallback.
6. **NextAuth Role Casting**:
   * `lib/auth.ts` has a type mismatch when assigning `session.user.role = token.role as string` since the NextAuth typings define `role` as `"CUSTOMER" | "ADMIN"`.
7. **Shippo SDK Construct Signature**:
   * `lib/shippo.ts` attempts to import Shippo as a default export (`import Shippo from 'shippo'`) and construct it directly. In the installed package (`shippo@2.18.0`), `Shippo` is a named export and should be initialized with:
     ```typescript
     import { Shippo } from 'shippo';
     const shippo = new Shippo({ apiKeyHeader: process.env.SHIPPO_API_KEY });
     ```
8. **Calendar ClassNames Mismatch**:
   * `app/components/ui/calendar.tsx` has a type mismatch with `react-day-picker` v10 since the key `table` is no longer supported in `classNames`. Casting the classNames object as `any` will resolve this.
