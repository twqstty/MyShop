import { useMemo, useState } from "react";
import "./CheckoutModal.css";

export default function CheckoutModal({ cart, user, isOpen, onClose, onSubmitOrder }) {
    const [form, setForm] = useState({
        fullName: "",
        email: user?.email || "",
        phone: "",
        address: "",
        comment: "",
    });

    const total = useMemo(
        () => cart.reduce((sum, item) => sum + item.product.price * item.qty, 0),
        [cart]
    );

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    function handleSubmit(e) {
        e.preventDefault();

        if (!form.fullName || !form.email || !form.phone || !form.address) {
            alert("Пожалуйста, заполните обязательные поля.");
            return;
        }

        onSubmitOrder?.(form);

        setForm({
            fullName: "",
            email: "",
            phone: "",
            address: "",
            comment: "",
        });
    }

    if (!isOpen) return null;

    return (
        <div className="checkoutOverlay" onClick={onClose}>
            <div className="checkoutModal" onClick={(e) => e.stopPropagation()}>
                <div className="checkoutModal__head">
                    <div>
                        <h2 className="checkoutModal__title">Оформление заказа</h2>
                        <p className="checkoutModal__sub">Заполните данные для доставки.</p>
                    </div>

                    <button className="checkoutModal__close" onClick={onClose} type="button">
                        ✕
                    </button>
                </div>

                <div className="checkoutModal__content">
                    <form className="checkoutForm" onSubmit={handleSubmit}>
                        <div className="checkoutField">
                            <label>ФИО *</label>
                            <input
                                type="text"
                                name="fullName"
                                value={form.fullName}
                                onChange={handleChange}
                                placeholder="Введите ФИО"
                            />
                        </div>

                        <div className="checkoutField">
                            <label>Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Введите email"
                            />
                        </div>

                        <div className="checkoutField">
                            <label>Телефон *</label>
                            <input
                                type="text"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="Введите телефон"
                            />
                        </div>

                        <div className="checkoutField">
                            <label>Адрес *</label>
                            <input
                                type="text"
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                placeholder="Введите адрес доставки"
                            />
                        </div>

                        <div className="checkoutField">
                            <label>Комментарий</label>
                            <input
                                type="text"
                                name="comment"
                                value={form.comment}
                                onChange={handleChange}
                                placeholder="Комментарий к заказу"
                            />
                        </div>

                        <div className="checkoutActions">
                            <button type="button" className="checkoutBtn checkoutBtn--ghost" onClick={onClose}>
                                Отмена
                            </button>
                            <button type="submit" className="checkoutBtn checkoutBtn--primary">
                                Подтвердить заказ
                            </button>
                        </div>
                    </form>

                    <div className="checkoutSummary">
                        <h3 className="checkoutSummary__title">Ваш заказ</h3>

                        <div className="checkoutSummary__list">
                            {cart.map((item) => (
                                <div key={item.product.id} className="checkoutItem">
                                    <div className="checkoutItem__imgWrap">
                                        <img
                                            src={item.product.image}
                                            alt={item.product.name}
                                            className="checkoutItem__img"
                                        />
                                    </div>

                                    <div className="checkoutItem__info">
                                        <div className="checkoutItem__name">{item.product.name}</div>
                                        <div className="checkoutItem__meta">
                                            {item.qty} × {Number(item.product.price).toFixed(2)} €
                                        </div>
                                    </div>

                                    <div className="checkoutItem__sum">
                                        {(item.qty * item.product.price).toFixed(2)} €
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="checkoutSummary__total">
                            <span>Итого:</span>
                            <b>{total.toFixed(2)} €</b>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}