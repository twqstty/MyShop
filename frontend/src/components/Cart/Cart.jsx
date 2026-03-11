import { useMemo, useState } from "react";
import "./Cart.css";

export default function Cart({ cart, total, onAdd, onRemove, onClear, onCheckout }) {
  const [collapsed, setCollapsed] = useState(false);
  const [clearing, setClearing] = useState(false);

  const count = useMemo(() => cart.reduce((s, x) => s + x.qty, 0), [cart]);

  function clear() {
    if (!onClear || cart.length === 0 || clearing) return;

    setClearing(true);

    setTimeout(() => {
      onClear();
      setClearing(false);
    }, 250);
  }

  return (
    <aside className={`cart ${collapsed ? "cart--collapsed" : ""}`}>
      <button
        type="button"
        className="cart__head"
        onClick={() => setCollapsed((v) => !v)}
        aria-expanded={!collapsed}
      >
        <div>
          <div className="cart__title">Корзина</div>
          <div className="cart__sub">{collapsed ? "Нажми, чтобы открыть" : "Товары и количество"}</div>
        </div>

        <div className="cart__headRight">
          <div className="cart__pill">{count}</div>
          <span className="cart__chev" aria-hidden="true">
            ▾
          </span>
        </div>
      </button>

      <div className="cart__content">
        <div className="cart__body">
          {cart.length === 0 ? (
            <div className="cart__empty">
              <div className="cart__emptyTitle">Пока пусто</div>
              <div className="cart__emptyText">Добавь товары слева, и они появятся здесь.</div>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className={`ci ${clearing ? "ci--removing" : ""}`}
              >
                <div className="ci__left">
                  <div className="ci__name">{item.product.name}</div>
                  <div className="ci__price">{item.product.price.toFixed(2)} € / шт</div>
                </div>

                <div className="ci__qty">
                  <button
                    className="ci__btn"
                    disabled={clearing}
                    onClick={() => onRemove(item.product.id)}
                    type="button"
                  >
                    -
                  </button>
                  <span className="ci__num">{item.qty}</span>
                  <button
                    className="ci__btn"
                    disabled={clearing}
                    onClick={() => onAdd(item.product)}
                    type="button"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart__foot">
          <div className="cart__totalRow">
            <span>Итого</span>
            <b>{total.toFixed(2)} €</b>
          </div>

          <div className="cart__actions">
            <button
              className="cart__clear"
              disabled={cart.length === 0 || clearing}
              onClick={clear}
              type="button"
            >
              Очистить
            </button>
            <button
              className="cart__checkout"
              disabled={cart.length === 0 || clearing}
              onClick={onCheckout}
              type="button"
            >
              Оформить заказ
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}