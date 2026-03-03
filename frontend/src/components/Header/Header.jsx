import "./Header.css";

export default function Header({ user, cartCount, onLogout }) {
  return (
    <header className="hdr">
      <div className="hdr__inner">
        <div className="brand">
          <div className="brand__logo">MS</div>
          <div className="brand__text">
            <div className="brand__name">MyShop</div>
            <div className="brand__tag">интернет-магазин компьютерной техники</div>
          </div>
        </div>

        <div className="hdr__right">
          <div id="cartBadge" className="cartBadge" title="Товары в корзине">
            <span className="cartBadge__icon">🛒</span>
            <span className="cartBadge__count">{cartCount}</span>
          </div>

          <div className="userBox">
            <div className="userBox__label">Вы вошли как</div>
            <div className="userBox__name">{user?.username || user?.email}</div>
          </div>

          <button className="btn btn--ghost" onClick={onLogout}>
            Выйти
          </button>
        </div>
      </div>
    </header>
  );
}