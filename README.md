# React 19 Store — Everyday Essentials

A responsive demo storefront built with React 19 and Vite. The app demonstrates React 19 data loading, Actions, Context, optimistic UI, and the ref-as-a-prop pattern.

## Assignment Tasks

### Task 1: Product Listing and Registration

- Product cards display product images, names, prices, categories, and descriptions.
- Product data is represented by a Promise and resolved asynchronously to demonstrate React 19's `use()`.
- `Suspense` displays a loading message while the Promise is pending; an Error Boundary displays a fallback if rendering throws an error.
- Registration is required before users can open product details or add items to the cart.
- The registration form uses a form `action` rather than an `onSubmit` handler.
- `useActionState` manages validation/success feedback and the result of the registration Action.
- `useFormStatus` powers the submit button's pending label and disabled state.
- The demo validates required fields, email format, and a minimum eight-character password, then simulates an asynchronous registration request.
- `UserContext` shares the registered user's name and email with the account panel.

### Task 2: Product Details and Cart

- Selecting a product after registration opens its details, description, price, and image.
- `useOptimistic` increments the visible cart count immediately while a simulated add-to-cart request runs.
- Successful requests update the cart's persistent React state; a test toggle simulates failure and demonstrates the optimistic count rolling back.
- The cart supports quantity changes, item removal, item subtotals, the total, and clearing the cart.
- `CartButton` receives `ref` as a normal prop (React 19; no `forwardRef` wrapper is used).
- A callback ref adds focus/blur listeners and returns cleanup logic to remove them. The “Focus add-to-cart button” control uses `useRef` to focus that DOM button directly.

## React 19 Resource Hints

The app uses two resource hints from `react-dom`:

- `preconnect('https://images.unsplash.com')` starts the connection to the image origin early, reducing connection setup work before image requests.
- `preload(firstProductImage, { as: 'image' })` signals that the first product image is important and may be fetched early, rather than waiting until the browser discovers it during rendering.

These hints are intended to improve resource loading; actual performance depends on the browser, network, and cache.

## Server Components and Client Components

A **Server Component** can render on the server and use server-only resources without shipping its component logic to the browser. A **Client Component** is needed for browser interactivity such as state, event handlers, form interactions, and hooks like `useOptimistic`.

In a React Server Components-capable framework, mostly static product presentation/data access could be rendered as Server Components, while interactive registration and cart controls would be Client Components. The interactive product-details/cart section needs client-side state and event handlers. This repository uses Vite as a client-rendered React application; it explains this division but does **not** configure a React Server Components runtime. The demo registration and cart requests are simulated in the browser, not backed by a production server.

## React Compiler

React Compiler can automatically optimize eligible components, calculations, and functions, reducing the need for manually adding `useMemo`, `useCallback`, or `memo` everywhere. For example, a manually memoized filtered list might look like:

```jsx
const filteredProducts = useMemo(
  () => products.filter((product) => product.category === category),
  [products, category],
)
```

When the compiler is configured and the code is eligible, it can infer and apply memoization automatically. This project does **not** claim React Compiler is enabled; `useCallback` in the callback-ref example is explicitly used to keep the ref callback stable.

## Run Locally

```bash
npm install
npm run dev
```

## Verification

```bash
npm run lint
npm run build
```

Run these commands locally before submitting. This repository update has not been verified by executing the app in a local runtime.

## Screenshot Evidence Checklist

Capture screenshots from the running app and attach them to the assignment/PR:

**Task 1**
1. Product listing (include product names, categories, prices, and images).
2. Loading state (“Loading products…”). Capture promptly after refreshing because the demo delay is short.
3. Registration form with required fields.
4. Validation feedback (for example, try an invalid email or a password shorter than eight characters).
5. Pending registration button (“Creating account…”).
6. Successful registration message and the account panel showing name/email.

**Task 2**
1. Product details after registration.
2. Optimistic cart count immediately after clicking “Add to cart”.
3. Updated cart list/count after the request succeeds.
4. Failure rollback: select “Simulate next add failure”, add the product, and capture the error plus restored count.
5. Ref interaction: click “Focus add-to-cart button” and capture its visible focus styling.
6. Cart quantity controls and total.

## Submission Links

- Repository: https://github.com/rsl-nehaAgarwal/react19-ecommerce
- Assignment branch: https://github.com/rsl-nehaAgarwal/react19-ecommerce/tree/feature/complete-react19-assignment
- Pull request: add the PR URL after it is created.
