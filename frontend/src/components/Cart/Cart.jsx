import { useMemo, useState } from "react";
import "./Cart.css";

export default function Cart({ cart, total, onAdd, onRemove }) {
  const [collapsed, setCollapsed] = useState(false);

  const count = useMemo(() => cart.reduce((s, x) => s + x.qty, 0), [cart]);

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
              <div key={item.product.id} className="ci">
                <div className="ci__left">
                  <div className="ci__name">{item.product.name}</div>
                  <div className="ci__price">{item.product.price.toFixed(2)} € / шт</div>
                </div>

                <div className="ci__qty">
                  <button className="ci__btn" onClick={() => onRemove(item.product.id)}>-</button>
                  <span className="ci__num">{item.qty}</span>
                  <button className="ci__btn" onClick={() => onAdd(item.product)}>+</button>
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
          <button
            className="cart__checkout"
            disabled={cart.length === 0}
            onClick={() => alert("Заказ оформлен (заглушка).")}
          >
            Оформить заказ
          </button>
        </div>
      </div>
    </aside>
  );
}