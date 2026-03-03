import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ProductCard.css";

export default function ProductCard({ product, onAdd }) {
  const navigate = useNavigate();
  const imgRef = useRef(null);

  return (
    <div className="pc">
      <div
        className="pc__imgWrap"
        onClick={() => navigate(`/product/${product.id}`)}
        style={{ cursor: "pointer" }}
      >
        <img ref={imgRef} className="pc__img" src={product.image} alt={product.name} />
      </div>

      <div className="pc__meta">
        <div className="pc__name">{product.name}</div>
        <div className="pc__desc">{product.desc}</div>
      </div>

      <div className="pc__bottom">
        <div className="pc__price">{product.price.toFixed(2)} €</div>
        <button className="pc__btn" onClick={() => onAdd(product, imgRef.current)}>
          Добавить
        </button>
      </div>
    </div>
  );
}