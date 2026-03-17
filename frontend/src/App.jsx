import { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Shop from "./components/Shop/Shop";
import ProductPage from "./components/ProductPage/ProductPage";
import Toast from "./components/Toast/Toast";
import CheckoutModal from "./components/CheckoutModal/CheckoutModal";
import AdminPanel from "./components/AdminPanel/AdminPanel";

import { getToken, clearToken } from "./components/api";
import { jwtDecode } from "jwt-decode";
import { api } from "./components/api";

export default function App() {
  const [page, setPage] = useState(getToken() ? "shop" : "register");
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    const token = getToken();

    if (!token) return;

    try {
      const decoded = jwtDecode(token);

      setUser({
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role,
      });

      setPage("shop");
    } catch (e) {
      clearToken();
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem("cart");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const cartCount = useMemo(
    () => cart.reduce((s, it) => s + it.qty, 0),
    [cart]
  );

  function onAuthed(u) {
    setUser(u);
    setPage("shop");
  }

  function onLogout() {
    setUser(null);
    setPage("login");
    clearToken();
  }

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  function addToCart(product) {
    setCart((prev) => {
      const found = prev.find((x) => x.product.id === product.id);
      if (found) {
        return prev.map((x) =>
          x.product.id === product.id ? { ...x, qty: x.qty + 1 } : x
        );
      }
      return [...prev, { product, qty: 1 }];
    });

    setToast({ title: "Добавлено в корзину", text: product.name });
  }

  function removeFromCart(productId) {
    setCart((prev) =>
      prev
        .map((x) =>
          x.product.id === productId ? { ...x, qty: x.qty - 1 } : x
        )
        .filter((x) => x.qty > 0)
    );
  }

  function clearCart() {
    setCart([]);
  }

  function openCheckout() {
    setIsCheckoutOpen(true);
  }

  function closeCheckout() {
    setIsCheckoutOpen(false);
  }

async function submitOrder(formData) {
  try {
    await api.createOrder({
      ...formData,
      cart,
    });

    alert("Заказ успешно оформлен!");

    setCart([]);
    setIsCheckoutOpen(false);

  } catch (e) {
    alert("Ошибка оформления заказа");
  }
}

  if (page === "register") {
    return <Register onAuthed={onAuthed} goLogin={() => setPage("login")} />;
  }

  if (page === "login") {
    return <Login onAuthed={onAuthed} goRegister={() => setPage("register")} />;
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Shop
              user={user}
              onLogout={onLogout}
              cart={cart}
              cartCount={cartCount}
              onAdd={addToCart}
              onRemove={removeFromCart}
              onClear={clearCart}
              onCheckout={openCheckout}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          }
        />

        <Route
          path="/product/:id"
          element={
            <ProductPage
              user={user}
              onLogout={onLogout}
              cartCount={cartCount}
              onAdd={addToCart}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          }
        />

        <Route
          path="/admin"
          element={
            user?.role === "ADMIN" ? (
              <AdminPanel />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toast toast={toast} onClose={() => setToast(null)} />

      <CheckoutModal
        cart={cart}
        user={user}
        isOpen={isCheckoutOpen}
        onClose={closeCheckout}
        onSubmitOrder={submitOrder}
      />
    </>
  );
}