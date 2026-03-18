import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";

export default function Header({ user, cartCount, onLogout, theme, onToggleTheme, favoritesCount = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const avatar = user ? localStorage.getItem(`avatar_${user.id}`) : null;

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(e) {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function toggleMenu() {
    setMenuOpen((prev) => !prev);
  }

  function handleLogout() {
    setMenuOpen(false);
    onLogout();
  }

  function handleThemeToggle() {
    onToggleTheme();
  }

  return (
    <header className="hdr">
      <div className="hdr__inner">
        <div className="brand">
          <div className="brand__logo">WW</div>
          <div className="brand__text">
            <div className="brand__name">WWShop</div>
            <div className="brand__tag">Интернет-магазин компьютерной техники</div>
          </div>
        </div>

        <div className="hdrMenu" ref={menuRef}>
          <button
            className={`burger ${menuOpen ? "burger--open" : ""}`}
            type="button"
            onClick={toggleMenu}
            aria-label="Открыть меню"
            aria-expanded={menuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className={`hdrDropdown ${menuOpen ? "hdrDropdown--open" : ""}`}>
            <div className="hdrDropdown__section">
              <div className="userBox">
                {avatar ? (
                  <img className="userBox__avatarImg" src={avatar} alt="avatar" />
                ) : (
                  <div className="userBox__avatar">
                    {(user?.username || user?.email)?.[0]?.toUpperCase()}
                  </div>
                )}

                <div className="userBox__info">
                  <div className="userBox__label">Вы вошли как</div>
                  <div className="userBox__name">{user?.username || user?.email}</div>
                </div>
              </div>
            </div>
            <div className="hdrDropdown__section">
              <button
                className="menuAction menuAction--theme"
                onClick={handleThemeToggle}
                type="button"
                title={theme === "light" ? "Включить тёмную тему" : "Включить светлую тему"}
              >
                <span className="menuAction__icon">
                  {theme === "light" ? "🌙" : "☀️"}
                </span>
                <span className="menuAction__text">
                  {theme === "light" ? "Тёмная тема" : "Светлая тема"}
                </span>
              </button>
            </div>

            <div className="hdrDropdown__section">
              <div className="favBadge" title="Избранные товары">
                <span className="favBadge__icon">♥</span>
                <span className="favBadge__label">Избранное</span>
                <span className="favBadge__count">{favoritesCount}</span>
              </div>
            </div>

            <div className="hdrDropdown__section">
              <div id="cartBadge" className="cartBadge" title="Товары в корзине">
                <span className="cartBadge__icon">🛒</span>
                <span className="cartBadge__label">Корзина</span>
                <span className="cartBadge__count">{cartCount}</span>
              </div>
            </div>

            <div className="hdrDropdown__section hdrDropdown__section--actions">
              {user?.role === "ADMIN" && (
                <Link className="btn btn--ghost btn--menu" to="/admin" onClick={() => setMenuOpen(false)}>
                  Админ
                </Link>
              )}

              <Link className="btn btn--menu" to="/profile" onClick={() => setMenuOpen(false)}>
                Изменить профиль
              </Link>

              <Link className="btn btn--menu" to="/favorites" onClick={() => setMenuOpen(false)}>
                Избранное
              </Link>

              <button className="btn btn--ghost btn--menu" onClick={handleLogout}>
                Выйти
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
