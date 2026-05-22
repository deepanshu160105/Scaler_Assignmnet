import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import SubNavbar from './components/layout/SubNavbar';
import Footer from './components/layout/Footer';

import Home          from './pages/Home';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Products      from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart          from './pages/Cart';
import Checkout      from './pages/Checkout';
import Orders        from './pages/Orders';
import OrderDetail   from './pages/OrderDetail';
import Account       from './pages/Account';
import Wishlist      from './pages/Wishlist';
import NotFound      from './pages/NotFound';

import './styles/index.css';

// Pages that shouldn't show the full nav (auth pages)
const AUTH_ROUTES = ['/login', '/register'];

function Layout() {
  const location = useLocation();
  const isAuthPage = AUTH_ROUTES.some(r => location.pathname.startsWith(r));

  return (
    <>
      {!isAuthPage && <Navbar />}
      {!isAuthPage && <SubNavbar />}

      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/products"  element={<Products />} />
        <Route path="/products/:slug" element={<ProductDetail />} />

        {/* Protected Routes */}
        <Route path="/cart"      element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/checkout"  element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/orders"    element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/orders/:orderNumber" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
        <Route path="/account"   element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="/wishlist"  element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />

        <Route path="*"          element={<NotFound />} />
      </Routes>

      {!isAuthPage && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <Layout />
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
