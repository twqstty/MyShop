import "./Shop.css";
import Header from "../Header/Header";
import ProductCard from "../ProductCard/ProductCard";
import Cart from "../Cart/Cart";
import { flyToCart } from "../flyToCart";
import { PRODUCTS } from "./productData";

export default function Shop({ user, onLogout, cart, cartCount, onAdd, onRemove }) {
  const total = cart.reduce((sum, it) => sum + it.product.price * it.qty, 0);

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
                <p className="catalog__sub">Выбери товары и добавь в корзину.</p>
              </div>
            </div>

            <div className="catalog__grid">
              {PRODUCTS.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={handleAdd} />
              ))}
            </div>
          </section>

          <Cart cart={cart} total={total} onAdd={(p) => handleAdd(p)} onRemove={onRemove} />
        </div>
      </main>
    </>
  );
}