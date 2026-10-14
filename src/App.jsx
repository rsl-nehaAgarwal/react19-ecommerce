import {
  Component,
  Suspense,
  createContext,
  use,
  useActionState,
  useCallback,
  useContext,
  useOptimistic,
  useRef,
  useState,
  startTransition,
} from 'react'
import { preconnect, preload } from 'react-dom'
import { useFormStatus } from 'react-dom'
import './App.css'

preconnect('https://images.unsplash.com')
preload(
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700',
  { as: 'image' },
)

const UserContext = createContext(null)

const productsPromise = new Promise((resolve) => {
  setTimeout(() => {
    resolve([
      {
        id: 1,
        name: 'Studio Wireless Headphones',
        price: 2499,
        category: 'Electronics',
        description:
          'Enjoy immersive sound, comfortable ear cushions and wireless listening for your everyday routine.',
        image:
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700',
      },
      {
        id: 2,
        name: 'Everyday Backpack',
        price: 1799,
        category: 'Accessories',
        description:
          'A versatile backpack with a clean design, roomy storage and practical everyday functionality.',
        image:
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700',
      },
      {
        id: 3,
        name: 'Minimal Wrist Watch',
        price: 3299,
        category: 'Lifestyle',
        description:
          'A timeless, minimalist watch designed to complement both casual and formal outfits.',
        image:
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700',
      },
    ])
  }, 1200)
})

class ProductErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <p className="notice error">
          Products could not be loaded. Please refresh the page and try again.
        </p>
      )
    }
    return this.props.children
  }
}

function ProductList({ onSelect }) {
  const products = use(productsPromise)

  return (
    <div className="product-grid">
      {products.map((product) => (
        <article className="product-card" key={product.id}>
          <img src={product.image} alt={product.name} loading="lazy" />
          <div className="product-info">
            <span className="category">{product.category}</span>
            <h3>{product.name}</h3>
            <p className="price">₹{product.price.toLocaleString('en-IN')}</p>
            <button onClick={() => onSelect(product)}>View details</button>
          </div>
        </article>
      ))}
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Creating account…' : 'Create account'}
    </button>
  )
}

async function registerAction(setRegisteredUser, previousState, formData) {
  const name = String(formData.get('name') || '').trim()
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '')

  if (!name || !email || !password) {
    return { error: 'Please complete all fields.', success: '' }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Enter a valid email address.', success: '' }
  }

  if (password.length < 8) {
    return { error: 'Password must contain at least 8 characters.', success: '' }
  }

  await new Promise((resolve) => setTimeout(resolve, 1200))

  const user = { name, email }
  setRegisteredUser(user)

  return {
    error: '',
    success: `Welcome, ${name}! Your demo account has been created.`,
  }
}

function RegistrationForm({ setRegisteredUser }) {
  const [state, formAction, isPending] = useActionState(
    registerAction.bind(null, setRegisteredUser),
    { error: '', success: '' },
  )

  return (
    <form action={formAction} className="registration-form">
      <label htmlFor="name">Full name</label>
      <input id="name" name="name" autoComplete="name" required />

      <label htmlFor="email">Email address</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
      />

      <label htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />

      {state.error && <p className="notice error">{state.error}</p>}
      {state.success && <p className="notice success">{state.success}</p>}

      <SubmitButton />
      {isPending && <p className="muted">Simulating secure registration…</p>}
    </form>
  )
}

function CartButton({ ref, onAdd, pending }) {
  const handleRef = useCallback((node) => {
    if (!node) return undefined

    const handleFocus = () => node.classList.add('cart-focused')
    const handleBlur = () => node.classList.remove('cart-focused')

    node.addEventListener('focus', handleFocus)
    node.addEventListener('blur', handleBlur)

    return () => {
      node.removeEventListener('focus', handleFocus)
      node.removeEventListener('blur', handleBlur)
    }
  }, [])

  return (
    <button
      ref={(node) => {
        const cleanup = handleRef(node)

        if (typeof ref === 'function') {
          const refCleanup = ref(node)
          return () => {
            cleanup?.()
            if (typeof refCleanup === 'function') refCleanup()
          }
        }

        if (ref && typeof ref === 'object') {
          ref.current = node
        }

        return () => {
          cleanup?.()
          if (ref && typeof ref === 'object' && ref.current === node) {
            ref.current = null
          }
        }
      }}
      onClick={onAdd}
      disabled={pending}
    >
      {pending ? 'Adding…' : 'Add to cart'}
    </button>
  )
}

function ProductDetails({ product, cartCount, setCartItems }) {
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  const [failNextAdd, setFailNextAdd] = useState(false)
  const [optimisticCart, addOptimistic] = useOptimistic(
    cartCount,
    (currentCount, quantity) => currentCount + quantity,
  )
  const buttonRef = useRef(null)

  async function addToCart() {
    setPending(true)
    setMessage('')

    startTransition(async () => {
      addOptimistic(1)

      try {
        await new Promise((resolve) => setTimeout(resolve, 900))

        if (failNextAdd) {
          setFailNextAdd(false)
          throw new Error('Simulated add-to-cart failure')
        }

        setCartItems((items) => {
          const existing = items.find((item) => item.id === product.id)
          if (existing) {
            return items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          }
          return [...items, { ...product, quantity: 1 }]
        })
        setMessage('Product added to your cart.')
      } catch {
        setMessage('Could not add the product. The optimistic update was rolled back. Please try again.')
      } finally {
        setPending(false)
      }
    })
  }

  return (
    <section className="details-panel" id="product-details">
      <div className="details-image">
        <img src={product.image} alt={product.name} />
      </div>
      <div className="details-copy">
        <span className="category">{product.category}</span>
        <h3>{product.name}</h3>
        <p className="price">₹{product.price.toLocaleString('en-IN')}</p>
        <p>{product.description}</p>
        <p className="cart-count">
          Cart items: <strong>{optimisticCart}</strong>
        </p>
        <CartButton
          ref={buttonRef}
          onAdd={addToCart}
          pending={pending}
        />
        <label className="failure-toggle">
          <input
            type="checkbox"
            checked={failNextAdd}
            onChange={(event) => setFailNextAdd(event.target.checked)}
            disabled={pending}
          />
          Simulate next add failure
        </label>
        {message && (
          <p
            className={`notice ${message.startsWith('Could not') ? 'error' : 'success'}`}
            role={message.startsWith('Could not') ? 'alert' : 'status'}
          >
            {message}
          </p>
        )}
        <p className="muted">
          The cart updates optimistically while the simulated request runs.
        </p>
      </div>
    </section>
  )
}

function RegisteredUser() {
  const user = useContext(UserContext)

  return (
    <section className="user-panel">
      <h2>Your account</h2>
      {user ? (
        <div>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <span className="notice success">Registered in this demo session</span>
        </div>
      ) : (
        <p className="muted">Create an account to see your details here.</p>
      )}
    </section>
  )
}

function App() {
  const [registeredUser, setRegisteredUser] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  return (
    <UserContext value={registeredUser}>
      <>
        <title>React 19 Store | Everyday Essentials</title>
        <meta
          name="description"
          content="Explore everyday products and experience React 19 features including Suspense, Actions, Context, and optimistic updates."
        />

        <header className="site-header">
          <a href="#home" className="brand">everyday<span>store.</span></a>
          <nav>
            <a href="#products">Products</a>
            <a href="#register">Register</a>
            <a href="#cart" className="header-cart">Cart ({cartCount})</a>
          </nav>
        </header>

        <main id="home">
          <section className="hero-section">
            <div>
              <p className="eyebrow">THE EVERYDAY EDIT</p>
              <h1>Thoughtful essentials.<br />Better everyday living.</h1>
              <p>Discover practical products selected for your daily routine.</p>
              <a className="hero-link" href="#products">Explore collection ↓</a>
            </div>
          </section>

          <section className="section" id="products">
            <div className="section-heading">
              <div>
                <p className="eyebrow">OUR COLLECTION</p>
                <h2>Popular picks</h2>
              </div>
              <span className="muted">A little something for every day</span>
            </div>

            <ProductErrorBoundary>
              <Suspense fallback={<p className="notice">Loading products…</p>}>
                <ProductList onSelect={setSelectedProduct} />
              </Suspense>
            </ProductErrorBoundary>
          </section>

          {selectedProduct && (
            <section className="section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">PRODUCT SPOTLIGHT</p>
                  <h2>Product details</h2>
                </div>
                <button className="secondary-button" onClick={() => setSelectedProduct(null)}>
                  Close details
                </button>
              </div>
              <ProductDetails
                product={selectedProduct}
                cartCount={cartCount}
                setCartItems={setCartItems}
              />
            </section>
          )}

          <section className="section cart-section" id="cart">
            <div className="section-heading">
              <div>
                <p className="eyebrow">YOUR SHOPPING</p>
                <h2>Your cart</h2>
              </div>
              <strong>{cartCount} {cartCount === 1 ? 'item' : 'items'}</strong>
            </div>
            {cartItems.length === 0 ? (
              <p className="muted">Your cart is empty. Explore the collection to add products.</p>
            ) : (
              <>
                <div className="cart-list">
                  {cartItems.map((item) => (
                    <article className="cart-item" key={item.id}>
                      <img src={item.image} alt={item.name} />
                      <div className="cart-item-info">
                        <span className="category">{item.category}</span>
                        <h3>{item.name}</h3>
                        <p className="price">₹{item.price.toLocaleString('en-IN')}</p>
                        <p className="muted">Subtotal: ₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="quantity-controls">
                        <button
                          aria-label={`Decrease quantity of ${item.name}`}
                          onClick={() => setCartItems((items) =>
                            items
                              .map((entry) => entry.id === item.id
                                ? { ...entry, quantity: entry.quantity - 1 }
                                : entry)
                              .filter((entry) => entry.quantity > 0)
                          )}
                        >−</button>
                        <strong>{item.quantity}</strong>
                        <button
                          aria-label={`Increase quantity of ${item.name}`}
                          onClick={() => setCartItems((items) =>
                            items.map((entry) => entry.id === item.id
                              ? { ...entry, quantity: entry.quantity + 1 }
                              : entry)
                          )}
                        >+</button>
                        <button
                          className="remove-item"
                          onClick={() => setCartItems((items) => items.filter((entry) => entry.id !== item.id))}
                        >Remove</button>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="cart-summary">
                  <p>Total ({cartCount} {cartCount === 1 ? 'item' : 'items'})</p>
                  <h3>₹{cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString('en-IN')}</h3>
                  <button className="secondary-button" onClick={() => setCartItems([])}>
                    Empty cart
                  </button>
                </div>
              </>
            )}
          </section>
          <section className="section registration-section" id="register">
            <div className="registration-intro">
              <p className="eyebrow">JOIN THE COMMUNITY</p>
              <h2>A better shopping experience starts here.</h2>
              <p>Create a demo account to see React 19 form Actions, validation, pending state and Context in action.</p>
              <RegisteredUser />
            </div>
            <div className="form-panel">
              <h2>Create your account</h2>
              <p className="muted">All fields are required. Use at least 8 characters for the password.</p>
              <RegistrationForm setRegisteredUser={setRegisteredUser} />
            </div>
          </section>
        </main>

        <footer>
          <a href="#home" className="brand">everyday<span>store.</span></a>
          <p>React 19 Features Assignment · Demo storefront</p>
        </footer>
      </>
    </UserContext>
  )
}

export default App
