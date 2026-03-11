import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ProductCard.css";

export default function ProductCard({ product, onAdd }) {
  const navigate = useNavigate();
  const imgRef = useRef(null);

  function openProduct() {
    navigate(`/product/${product.id}`);
  }

  function handleAdd(e) {
    e.stopPropagation();
    onAdd(product, imgRef.current);
  }

  return (
    <div className="pc" onClick={openProduct} role="button" tabIndex={0}>
      <div className="pc__imgWrap">
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