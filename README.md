# React 19 Store — Everyday Essentials

A responsive demo storefront built with React 19 and Vite.

## Features

### Task 1: Product Listing and Registration
- Product listing with images, names, prices, categories, and descriptions.
- React 19 `use()` with `Suspense` for asynchronous product loading.
- Error boundary for product-loading errors.
- Document title, meta description, `preload`, and `preconnect`.
- Registration using form Actions, `useActionState`, and `useFormStatus`.
- Validation, pending feedback, and success/error messages.
- React Context shares registered-user information.

### Task 2: Product Details and Cart
- Product details and product-based shopping cart.
- `useOptimistic` for immediate cart-count updates.
- Quantity controls, item removal, subtotals, and total calculation.
- Simulated failure handling and optimistic rollback.
- React 19 `ref` prop and callback-ref cleanup for event listeners.

## Server Components and Client Components

Server Components render on the server and can access server-only resources. Client Components support interactivity, state, event handlers, and browser APIs. Frameworks that support React Server Components use the `'use client'` directive to mark client entry points.

This project uses Vite as a client-rendered React application. It explains the distinction but does not configure a React Server Components runtime.

## React Compiler

React Compiler can automatically optimize supported components, calculations, and functions, reducing the need for manual `useMemo`, `useCallback`, and `memo` in eligible code.

For example, without compiler optimization:

    const filteredProducts = useMemo(
      () => products.filter((product) => product.category === category),
      [products, category]
    );

When React Compiler is configured and the code is eligible, it can infer and apply memoization automatically. This project does not claim the compiler is enabled.

## Run Locally

    npm install
    npm run dev

## Verification

    npm run lint
    npm run build

## Assignment Evidence

Capture screenshots of:
- Product listing and loading state
- Registration validation, pending, and success states
- Registered-user details
- Optimistic cart update and simulated failure rollback
- Cart quantities and total

Repository URL, branch name, and pull request URL should be added after publishing to GitHub.
