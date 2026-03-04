import { useEffect, useState } from "react";
import "./Shop.css";
import Header from "../Header/Header";
import ProductCard from "../ProductCard/ProductCard";
import Cart from "../Cart/Cart";
import { flyToCart } from "../flyToCart";
import { api } from "../api";

export default function Shop({ user, onLogout, cart, cartCount, onAdd, onRemove, onClear }) {
  const [products, setProducts] = useState([]);
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState("");

  const total = cart.reduce((sum, it) => sum + it.product.price * it.qty, 0);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setErr("");
        setBusy(true);
        const res = await api.getProducts();
        if (!alive) return;
        setProducts(res.products || []);
      } catch (e) {
        if (!alive) return;
        setErr(e.message);
      } finally {
        if (!alive) return;
        setBusy(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  function handleAdd(product, imgEl) {
    onAdd(product);

    const target = document.getElementById("cartBadge");
    if (imgEl && target) flyToCart(imgEl, target);
  }

  return (
    <>
      <Header user={user} cartCount={cartCount} onLogout={onLogout} />

      <main className="shop">
        <div className="shop__inner">
          <section className="catalog">
            <div className="catalog__head">
              <div>
                <h2 className="catalog__title">Каталог</h2>
                <p className="catalog__sub">Подбери для себя самую лучшую игровую периферию</p>
              </div>
            </div>

            {busy && <p style={{ padding: 12 }}>Загрузка товаров…</p>}
            {err && <p style={{ padding: 12, color: "crimson" }}>{err}</p>}

            <div className="catalog__grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={handleAdd} />
              ))}
            </div>
          </section>

          <Cart
            cart={cart}
            total={total}
            onAdd={(p) => handleAdd(p)}
            onRemove={onRemove}
            onClear={onClear}
          />
        </div>
      </main>
    </>
  );
}