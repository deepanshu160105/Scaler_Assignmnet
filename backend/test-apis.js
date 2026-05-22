// API Test Script — Tests all endpoints sequentially
// Run: node test-apis.js

const BASE = "http://localhost:5000/api";
let TOKEN = "";
let productId = "";
let productSlug = "";
let categorySlug = "";
let cartItemId = "";
let addressId = "";
let orderNumber = "";

async function request(method, path, body = null, auth = false) {
  const headers = { "Content-Type": "application/json" };
  if (auth && TOKEN) headers["Authorization"] = `Bearer ${TOKEN}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();
  return { status: res.status, data };
}

function log(label, result) {
  const icon = result.data.success ? "✅" : "❌";
  console.log(`${icon} [${result.status}] ${label}`);
  if (!result.data.success) {
    console.log(`   Error: ${result.data.message}`);
  }
  return result;
}

async function runTests() {
  console.log("\n" + "═".repeat(60));
  console.log("  AMAZON CLONE API — TEST SUITE");
  console.log("═".repeat(60) + "\n");

  // ─── HEALTH CHECK ─────────────────────────
  console.log("── Health Check ────────────────────");
  log("GET /api/health", await request("GET", "/health"));

  // ─── AUTH ──────────────────────────────────
  console.log("\n── Auth ────────────────────────────");

  // Login with demo user
  let r = await request("POST", "/auth/login", {
    email: "demo@amazon.com",
    password: "password123",
  });
  log("POST /api/auth/login (demo user)", r);
  TOKEN = r.data.data?.token || "";
  console.log(`   Token: ${TOKEN.substring(0, 30)}...`);

  // Get profile
  log("GET /api/auth/me", await request("GET", "/auth/me", null, true));

  // Update profile
  log("PUT /api/auth/me", await request("PUT", "/auth/me", { name: "Demo User Updated", phone: "+91 1234567890" }, true));

  // Login with wrong password
  log("POST /api/auth/login (wrong password)", await request("POST", "/auth/login", {
    email: "demo@amazon.com",
    password: "wrongpassword",
  }));

  // Access protected route without token
  log("GET /api/auth/me (no token)", await request("GET", "/auth/me"));

  // ─── CATEGORIES ────────────────────────────
  console.log("\n── Categories ──────────────────────");

  r = await request("GET", "/categories");
  log("GET /api/categories", r);
  console.log(`   Found ${r.data.data?.categories?.length} categories`);
  if (r.data.data?.categories?.length > 0) {
    categorySlug = r.data.data.categories[0].slug;
    console.log(`   First category slug: ${categorySlug}`);
  }

  r = await request("GET", `/categories/${categorySlug}`);
  log(`GET /api/categories/${categorySlug}`, r);
  console.log(`   Products in category: ${r.data.data?.pagination?.total}`);

  // ─── PRODUCTS ──────────────────────────────
  console.log("\n── Products ────────────────────────");

  r = await request("GET", "/products");
  log("GET /api/products (all)", r);
  console.log(`   Total products: ${r.data.data?.pagination?.total}`);
  if (r.data.data?.products?.length > 0) {
    productId = r.data.data.products[0].id;
    productSlug = r.data.data.products[0].slug;
    console.log(`   First product: ${r.data.data.products[0].name}`);
  }

  // Search
  r = await request("GET", "/products?search=iphone");
  log("GET /api/products?search=iphone", r);
  console.log(`   Search results: ${r.data.data?.pagination?.total}`);

  // Filter by category
  r = await request("GET", `/products?category=${categorySlug}`);
  log(`GET /api/products?category=${categorySlug}`, r);
  console.log(`   Category filter results: ${r.data.data?.pagination?.total}`);

  // Sort by price
  r = await request("GET", "/products?sort=price_asc&limit=3");
  log("GET /api/products?sort=price_asc&limit=3", r);
  if (r.data.data?.products) {
    console.log(`   Cheapest: ₹${r.data.data.products[0]?.price}`);
  }

  // Price range filter
  r = await request("GET", "/products?minPrice=1000&maxPrice=5000");
  log("GET /api/products?minPrice=1000&maxPrice=5000", r);
  console.log(`   Price range results: ${r.data.data?.pagination?.total}`);

  // Pagination
  r = await request("GET", "/products?page=2&limit=5");
  log("GET /api/products?page=2&limit=5", r);
  console.log(`   Page 2 results: ${r.data.data?.products?.length} items`);

  // Product detail by slug
  r = await request("GET", `/products/${productSlug}`);
  log(`GET /api/products/${productSlug}`, r);
  console.log(`   Price: ₹${r.data.data?.product?.price}, Stock: ${r.data.data?.product?.stock}`);

  // Product not found
  log("GET /api/products/nonexistent-slug", await request("GET", "/products/nonexistent-slug"));

  // ─── REVIEWS ───────────────────────────────
  console.log("\n── Reviews ─────────────────────────");

  r = await request("POST", `/products/${productId}/reviews`, {
    rating: 5,
    title: "Amazing product!",
    comment: "Best purchase I've made this year.",
  }, true);
  log(`POST /api/products/${productId}/reviews`, r);

  r = await request("GET", `/products/${productId}/reviews`);
  log(`GET /api/products/${productId}/reviews`, r);
  console.log(`   Total reviews: ${r.data.data?.pagination?.total}`);

  // Duplicate review
  r = await request("POST", `/products/${productId}/reviews`, {
    rating: 3,
    title: "Duplicate",
  }, true);
  log("POST review (duplicate - should fail)", r);

  // ─── CART ──────────────────────────────────
  console.log("\n── Cart ────────────────────────────");

  // Get empty cart
  r = await request("GET", "/cart", null, true);
  log("GET /api/cart (initial)", r);
  console.log(`   Items: ${r.data.data?.cart?.itemCount}, Subtotal: ₹${r.data.data?.cart?.subtotal}`);

  // Add to cart
  r = await request("POST", "/cart/items", { productId, quantity: 2 }, true);
  log("POST /api/cart/items (add product)", r);
  console.log(`   Items: ${r.data.data?.cart?.itemCount}, Subtotal: ₹${r.data.data?.cart?.subtotal}`);
  if (r.data.data?.cart?.items?.length > 0) {
    cartItemId = r.data.data.cart.items[0].id;
  }

  // Add same product again (should increase quantity)
  r = await request("POST", "/cart/items", { productId, quantity: 1 }, true);
  log("POST /api/cart/items (add same product - qty should increase)", r);
  console.log(`   Items: ${r.data.data?.cart?.itemCount}, Subtotal: ₹${r.data.data?.cart?.subtotal}`);

  // Update cart item quantity
  r = await request("PUT", `/cart/items/${cartItemId}`, { quantity: 1 }, true);
  log(`PUT /api/cart/items/${cartItemId} (set qty=1)`, r);
  console.log(`   Items: ${r.data.data?.cart?.itemCount}, Subtotal: ₹${r.data.data?.cart?.subtotal}`);

  // ─── ADDRESSES ─────────────────────────────
  console.log("\n── Addresses ───────────────────────");

  r = await request("GET", "/addresses", null, true);
  log("GET /api/addresses", r);
  console.log(`   Found ${r.data.data?.addresses?.length} addresses`);
  if (r.data.data?.addresses?.length > 0) {
    addressId = r.data.data.addresses[0].id;
  }

  // Add new address
  r = await request("POST", "/addresses", {
    fullName: "Test User",
    phone: "+91 9999999999",
    addressLine1: "789 Test Road",
    addressLine2: "Floor 3",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
  }, true);
  log("POST /api/addresses (add new)", r);
  const newAddressId = r.data.data?.address?.id;

  // Set as default
  if (newAddressId) {
    r = await request("PUT", `/addresses/${newAddressId}/default`, {}, true);
    log(`PUT /api/addresses/${newAddressId}/default`, r);
  }

  // Delete the new address
  if (newAddressId) {
    r = await request("DELETE", `/addresses/${newAddressId}`, null, true);
    log(`DELETE /api/addresses/${newAddressId}`, r);
  }

  // ─── WISHLIST ──────────────────────────────
  console.log("\n── Wishlist ────────────────────────");

  r = await request("POST", "/wishlist", { productId }, true);
  log("POST /api/wishlist (add)", r);

  r = await request("GET", "/wishlist", null, true);
  log("GET /api/wishlist", r);
  console.log(`   Wishlist items: ${r.data.data?.wishlist?.length}`);

  // Duplicate add
  r = await request("POST", "/wishlist", { productId }, true);
  log("POST /api/wishlist (duplicate - should fail)", r);

  r = await request("DELETE", `/wishlist/${productId}`, null, true);
  log(`DELETE /api/wishlist/${productId}`, r);

  // ─── ORDERS ────────────────────────────────
  console.log("\n── Orders ──────────────────────────");

  // Place order (need item in cart first)
  // Re-add to cart
  await request("POST", "/cart/items", { productId, quantity: 1 }, true);

  r = await request("POST", "/orders", { addressId, paymentMethod: "COD" }, true);
  log("POST /api/orders (place order)", r);
  if (r.data.data?.order) {
    orderNumber = r.data.data.order.orderNumber;
    console.log(`   Order Number: ${orderNumber}`);
    console.log(`   Total: ₹${r.data.data.order.totalAmount}`);
  }

  // Order history
  r = await request("GET", "/orders", null, true);
  log("GET /api/orders (history)", r);
  console.log(`   Total orders: ${r.data.data?.pagination?.total}`);

  // Order detail
  if (orderNumber) {
    r = await request("GET", `/orders/${orderNumber}`, null, true);
    log(`GET /api/orders/${orderNumber}`, r);
    console.log(`   Status: ${r.data.data?.order?.status}`);
  }

  // Cancel order
  if (orderNumber) {
    r = await request("PUT", `/orders/${orderNumber}/cancel`, {}, true);
    log(`PUT /api/orders/${orderNumber}/cancel`, r);
    console.log(`   New status: ${r.data.data?.order?.status}`);
  }

  // Try cancelling again (should fail)
  if (orderNumber) {
    r = await request("PUT", `/orders/${orderNumber}/cancel`, {}, true);
    log("PUT /api/orders cancel (already cancelled - should fail)", r);
  }

  // Verify cart is empty after order
  r = await request("GET", "/cart", null, true);
  log("GET /api/cart (after order - should be empty)", r);
  console.log(`   Items: ${r.data.data?.cart?.itemCount}`);

  // ─── 404 ROUTE ─────────────────────────────
  console.log("\n── Edge Cases ──────────────────────");
  log("GET /api/nonexistent (404)", await request("GET", "/nonexistent"));

  // Validation error
  r = await request("POST", "/auth/login", { email: "not-an-email" });
  log("POST /api/auth/login (validation error)", r);

  console.log("\n" + "═".repeat(60));
  console.log("  TEST SUITE COMPLETE");
  console.log("═".repeat(60) + "\n");
}

runTests().catch(console.error);
