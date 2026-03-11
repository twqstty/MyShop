import { useEffect, useMemo, useState } from "react";
import "./Shop.css";
import Header from "../Header/Header";
import ProductCard from "../ProductCard/ProductCard";
import Cart from "../Cart/Cart";
import { flyToCart } from "../flyToCart";
import { api } from "../api";

export default function Shop({ user, onLogout, cart, cartCount, onAdd, onRemove, onClear, onCheckout }) {
  const [products, setProducts] = useState([]);
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");

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

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(q) ||
        product.desc.toLowerCase().includes(q)
      );
    });
  }, [products, search]);

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
              <div className="catalog__top">
                <div>
                  <h2 className="catalog__title">Каталог</h2>
                  <p className="catalog__sub">
                    Найди свою идеальную игровую периферию.
                  </p>
                </div>
              </div>

              <div className="catalog__searchWrap">
                <span className="catalog__searchIcon">⌕</span>

                <input
                  className="catalog__search"
                  type="text"
                  placeholder="Поиск по названию или описанию..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                {search && (
                  <button
                    type="button"
                    className="catalog__clearSearch"
                    onClick={() => setSearch("")}
                    aria-label="Очистить поиск"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {busy && <p className="catalog__status">Загрузка товаров…</p>}
            {err && <p className="catalog__status catalog__status--error">{err}</p>}

            {!busy && !err && filteredProducts.length === 0 && (
              <p className="catalog__status">Ничего не найдено.</p>
            )}

            <div className="catalog__grid">
              {filteredProducts.map((p) => (
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
            onCheckout={onCheckout}
          />
        </div>
      </main>
    </>
  );
}