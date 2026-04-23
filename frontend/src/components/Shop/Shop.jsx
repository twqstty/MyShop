import { useEffect, useMemo, useState } from "react";
import "./Shop.css";
import Header from "../Header/Header";
import ProductCard from "../ProductCard/ProductCard";
import Cart from "../Cart/Cart";
import { flyToCart } from "../flyToCart";
import { api } from "../api";

const CATEGORY_RULES = [
  { key: "mouse", label: "Мышки", keywords: ["mouse", "мыш"] },
  { key: "keyboard", label: "Клавиатуры", keywords: ["keyboard", "keybord", "клав"] },
  { key: "headphones", label: "Наушники", keywords: ["headphone", "науш"] },
  { key: "monitor", label: "Мониторы", keywords: ["monitor", "монитор"] },
  { key: "mat", label: "Коврики", keywords: ["kovrik", "коврик", "pad"] },
];

const SIDEBAR_AD_LINK = "https://betboom.ru/?storyly=%5B290505%2C4173964%5D&storylyResume=1";
const SIDEBAR_AD_IMAGE = "https://static.legalcdn.org/38/64/6867d9d6ec8cf_1751636438-274x490.jpeg";

function detectCategory(product) {
  const text = `${product.name}`.toLowerCase();
  const match = CATEGORY_RULES.find((rule) =>
    rule.keywords.some((keyword) => text.includes(keyword))
  );

  return match
    ? { value: match.key, label: match.label }
    : { value: "other", label: "Другое" };
}

export default function Shop({
  user,
  onLogout,
  cart,
  cartCount,
  onAdd,
  onRemove,
  onClear,
  onCheckout,
  theme,
  onToggleTheme,
  favoritesCount,
  isFavorite,
  onToggleFavorite,
}) {
  const [catalogCollapsed, setCatalogCollapsed] = useState(false);
  const [products, setProducts] = useState([]);
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [priceFilter, setPriceFilter] = useState("all");

  const total = cart.reduce((sum, it) => sum + it.product.price * it.qty, 0);

  useEffect(() => {
    let alive = true;

    const loadProducts = async () => {
      try {
        setErr("");
        setBusy(true);
        const res = await api.getProducts();
        if (alive) {
          setProducts(res.products || []);
        }
      } catch (e) {
        if (alive) {
          setErr(e.message);
        }
      } finally {
        if (alive) {
          setBusy(false);
        }
      }
    };

    loadProducts();

    return () => {
      alive = false;
    };
  }, []);

  const categoryOptions = useMemo(() => {
    const categories = new Map();

    products.forEach((product) => {
      const category = detectCategory(product);
      categories.set(category.value, category.label);
    });

    return [{ value: "all", label: "Все категории" }].concat(
      Array.from(categories.entries()).map(([value, label]) => ({ value, label }))
    );
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    return products
      .filter((product) => {
        if (q) {
          const matchesSearch =
            product.name.toLowerCase().includes(q) ||
            product.desc.toLowerCase().includes(q);

          if (!matchesSearch) {
            return false;
          }
        }

        if (selectedCategory !== "all") {
          const category = detectCategory(product);
          if (category.value !== selectedCategory) {
            return false;
          }
        }

        if (priceFilter === "under50" && Number(product.price) >= 50) {
          return false;
        }

        if (
          priceFilter === "50to100" &&
          (Number(product.price) < 50 || Number(product.price) > 100)
        ) {
          return false;
        }

        if (priceFilter === "over100" && Number(product.price) <= 100) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") {
          return Number(a.price) - Number(b.price);
        }

        if (sortBy === "price-desc") {
          return Number(b.price) - Number(a.price);
        }

        if (sortBy === "name-asc") {
          return a.name.localeCompare(b.name, "ru");
        }

        return a.id - b.id;
      });
  }, [products, search, selectedCategory, priceFilter, sortBy]);

  const hasActiveFilters =
    search.trim() || selectedCategory !== "all" || sortBy !== "default" || priceFilter !== "all";

  function resetFilters() {
    setSearch("");
    setSelectedCategory("all");
    setSortBy("default");
    setPriceFilter("all");
  }

  function handleAdd(product, imgEl) {
    onAdd(product);

    const target = document.getElementById("cartBadge");
    if (imgEl && target) flyToCart(imgEl, target);
  }

  return (
    <>
      <Header user={user}
      cartCount={cartCount}
      onLogout={onLogout}
      theme={theme}
      onToggleTheme={onToggleTheme}
      favoritesCount={favoritesCount}
      />

      <main className="shop">
        <div className="shop__inner">
          <section className="catalog">
            <div className={`catalog__head ${catalogCollapsed ? "catalog__head--collapsed" : ""}`}>
              <button
                type="button"
                className="catalog__top"
                onClick={() => setCatalogCollapsed((value) => !value)}
                aria-expanded={!catalogCollapsed}
              >
                <div>
                  <h2 className="catalog__title">Каталог</h2>
                  <p className="catalog__sub">
                    Найди свою идеальную игровую периферию.
                  </p>
                </div>

                <div className="catalog__headRight">
                  <div className="catalog__pill">{filteredProducts.length}</div>
                  <span className="catalog__chev" aria-hidden="true">
                    ▾
                  </span>
                </div>
              </button>

              <div className="catalog__content">
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

                <div className="catalog__filters">
                  <label className="catalog__filter">
                    <span className="catalog__filterLabel">Категория</span>
                    <select
                      className="catalog__select"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      {categoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="catalog__filter">
                    <span className="catalog__filterLabel">Цена</span>
                    <select
                      className="catalog__select"
                      value={priceFilter}
                      onChange={(e) => setPriceFilter(e.target.value)}
                    >
                      <option value="all">Любая цена</option>
                      <option value="under50">До 50 €</option>
                      <option value="50to100">50 € - 100 €</option>
                      <option value="over100">Больше 100 €</option>
                    </select>
                  </label>

                  <label className="catalog__filter">
                    <span className="catalog__filterLabel">Сортировка</span>
                    <select
                      className="catalog__select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="default">По умолчанию</option>
                      <option value="price-asc">Сначала дешевле</option>
                      <option value="price-desc">Сначала дороже</option>
                      <option value="name-asc">По названию</option>
                    </select>
                  </label>
                </div>

                <div className="catalog__toolbar">
                  <p className="catalog__result">
                    Найдено товаров: <b>{filteredProducts.length}</b>
                  </p>

                  <button
                    type="button"
                    className="catalog__reset"
                    onClick={resetFilters}
                    disabled={!hasActiveFilters}
                  >
                    Сбросить фильтры
                  </button>
                </div>
              </div>
            </div>

            {busy && <p className="catalog__status">Загрузка товаров…</p>}
            {err && <p className="catalog__status catalog__status--error">{err}</p>}

            {!busy && !err && filteredProducts.length === 0 && (
              <p className="catalog__status">Ничего не найдено.</p>
            )}

            <div className="catalog__grid">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAdd={handleAdd}
                  isFavorite={isFavorite?.(p.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          </section>

          <aside className="shop__aside">
            <Cart
              cart={cart}
              total={total}
              onAdd={(p) => handleAdd(p)}
              onRemove={onRemove}
              onClear={onClear}
              onCheckout={onCheckout}
            />

            <a
              className="shopAd"
              href={SIDEBAR_AD_LINK}
              target="_blank"
              rel="noreferrer"
            >
              <img
                className="shopAd__image"
                src={SIDEBAR_AD_IMAGE}
                alt="Реклама"
              />
            </a>
          </aside>
        </div>
      </main>
    </>
  );
}
