import { useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import ProductCard from "../ProductCard/ProductCard";
import "./FavoritesPage.css";

export default function FavoritesPage({
  user,
  onLogout,
  cartCount,
  theme,
  onToggleTheme,
  favorites,
  onAdd,
  onToggleFavorite,
  favoritesCount,
}) {
  const navigate = useNavigate();

  return (
    <>
      <Header
        user={user}
        cartCount={cartCount}
        onLogout={onLogout}
        theme={theme}
        onToggleTheme={onToggleTheme}
        favoritesCount={favoritesCount}
      />

      <main className="favoritesPage">
        <div className="favoritesPage__inner">
          <button className="favoritesPage__back" onClick={() => navigate("/")} type="button">
            ← Назад в магазин
          </button>

          <section className="favoritesPage__hero">
            <h1 className="favoritesPage__title">Избранное</h1>
            <p className="favoritesPage__sub">
              Здесь собраны товары, которые ты отметил на будущее.
            </p>
          </section>

          {favorites.length === 0 ? (
            <section className="favoritesPage__empty">
              <h2 className="favoritesPage__emptyTitle">Пока ничего нет</h2>
              <p className="favoritesPage__emptyText">
                Нажми на сердечко у товара, и он появится в избранном.
              </p>
            </section>
          ) : (
            <section className="favoritesPage__grid">
              {favorites.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={onAdd}
                  isFavorite={true}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </section>
          )}
        </div>
      </main>
    </>
  );
}
