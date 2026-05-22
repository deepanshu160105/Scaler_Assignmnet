# Amazon Clone — Backend API

A full-featured e-commerce REST API built with Express.js, Prisma ORM, and PostgreSQL.

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT (jsonwebtoken + bcryptjs)
- **Validation**: express-validator
- **Email**: Nodemailer
- **Deployment**: Render (backend), Supabase (database)

## Features

- 🔐 **JWT Authentication** with OTP email verification on signup
- 📦 **Product Management** — listing with search, filter by category, price range, sorting, pagination
- 🛒 **Shopping Cart** — add, update quantity, remove items with stock validation
- 📍 **Address Management** — CRUD with default address support
- 📋 **Order Placement** — transactional order creation with stock deduction, order history, cancellation
- ❤️ **Wishlist** — add/remove products
- ⭐ **Reviews** — rate and review products with auto-updating product ratings
- 📧 **Email Notifications** — OTP verification and order confirmation emails

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)

### Installation

```bash
cd backend
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` — Supabase pooled connection string (port 6543)
- `DIRECT_URL` — Supabase direct connection string (port 5432)
- `JWT_SECRET` — Secret key for JWT signing

Optional variables:
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` — For email OTP & order confirmations

### Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database with sample data
npx prisma db seed
```

### Run

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/send-otp` | ❌ | Send OTP to email |
| POST | `/api/auth/verify-otp` | ❌ | Verify OTP |
| POST | `/api/auth/register` | ❌ | Register (requires verified OTP) |
| POST | `/api/auth/login` | ❌ | Login |
| GET | `/api/auth/me` | ✅ | Get profile |
| PUT | `/api/auth/me` | ✅ | Update profile |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | ❌ | List products (search, filter, sort, paginate) |
| GET | `/api/products/:slug` | ❌ | Product detail |
| GET | `/api/products/:id/reviews` | ❌ | Product reviews |
| POST | `/api/products/:id/reviews` | ✅ | Add review |

### Categories
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/categories` | ❌ | List categories |
| GET | `/api/categories/:slug` | ❌ | Category with products |

### Cart
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/cart` | ✅ | View cart |
| POST | `/api/cart/items` | ✅ | Add to cart |
| PUT | `/api/cart/items/:itemId` | ✅ | Update quantity |
| DELETE | `/api/cart/items/:itemId` | ✅ | Remove item |
| DELETE | `/api/cart` | ✅ | Clear cart |

### Addresses
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/addresses` | ✅ | List addresses |
| POST | `/api/addresses` | ✅ | Add address |
| PUT | `/api/addresses/:id` | ✅ | Update address |
| DELETE | `/api/addresses/:id` | ✅ | Delete address |
| PUT | `/api/addresses/:id/default` | ✅ | Set default |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders` | ✅ | Place order |
| GET | `/api/orders` | ✅ | Order history |
| GET | `/api/orders/:orderNumber` | ✅ | Order detail |
| PUT | `/api/orders/:orderNumber/cancel` | ✅ | Cancel order |

### Wishlist
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/wishlist` | ✅ | View wishlist |
| POST | `/api/wishlist` | ✅ | Add to wishlist |
| DELETE | `/api/wishlist/:productId` | ✅ | Remove from wishlist |

## Default User (After Seeding)

- **Email**: demo@amazon.com
- **Password**: password123

## Deployment on Render

1. Connect your GitHub repo to Render
2. Set environment variables in Render dashboard
3. **Build Command**: `npm run build`
4. **Start Command**: `npm start`

## Database Schema

The database includes 10 models: User, Otp, Category, Product, Cart, CartItem, Address, Order, OrderItem, Wishlist, and Review with proper foreign keys, indexes, and constraints.

## Assumptions

- Prices are in INR (₹)
- Free shipping for orders above ₹500
- 18% GST applied on all orders
- OTP expires in 10 minutes
- JWT tokens expire in 7 days
- One review per user per product
