import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ProductCard.css";

export default function ProductCard({ product, onAdd, isFavorite = false, onToggleFavorite }) {
  const navigate = useNavigate();
  const imgRef = useRef(null);

  function openProduct() {
    navigate(`/product/${product.id}`);
  }

  function handleAdd(e) {
    e.stopPropagation();
    onAdd(product, imgRef.current);
  }

  function handleFavorite(e) {
    e.stopPropagation();
    onToggleFavorite?.(product);
  }

  return (
    <div className="pc" onClick={openProduct} role="button" tabIndex={0}>
      <div className="pc__imgWrap">
        <button
          className={`pc__fav ${isFavorite ? "pc__fav--active" : ""}`}
          type="button"
          onClick={handleFavorite}
          aria-label={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
        >
          {isFavorite ? "♥" : "♡"}
        </button>
        <img
          ref={imgRef}
          className="pc__img"
          src={product.image}
          alt={product.name}
        />
      </div>

      <div className="pc__meta">
        <div className="pc__name">{product.name}</div>
        <div className="pc__desc">{product.desc}</div>
      </div>

      <div className="pc__bottom">
        <div className="pc__price">{Number(product.price).toFixed(2)} €</div>
        <button className="pc__btn" onClick={handleAdd}>
          Добавить
        </button>
      </div>
    </div>
  );
}
