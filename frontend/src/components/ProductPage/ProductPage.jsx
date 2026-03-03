import { useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProductPage.css";
import { PRODUCTS } from "../Shop/productData";
import Header from "../Header/Header";
import { flyToCart } from "../flyToCart";

export default function ProductPage({ user, onLogout, cartCount, onAdd }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const imgRef = useRef(null);

  const product = PRODUCTS.find((p) => p.id === Number(id));
  if (!product) return <div style={{ padding: 40 }}>Товар не найден</div>;

  function addHere() {
    onAdd(product);
    const target = document.getElementById("cartBadge");
    if (imgRef.current && target) flyToCart(imgRef.current, target);
  }

  return (
    <>
      <Header user={user} cartCount={cartCount} onLogout={onLogout} />

      <div className="pp">
        <button className="pp__back" onClick={() => navigate(-1)}>
          ← Назад
        </button>

        <div className="pp__card">
          <div className="pp__imageWrap">
            <img ref={imgRef} src={product.image} alt={product.name} />
          </div>

          <div className="pp__info">
            <h1>{product.name}</h1>
            <p className="pp__desc">{product.desc}</p>
            <div className="pp__price">{product.price.toFixed(2)} €</div>

            <button className="pp__btn" onClick={addHere}>
              Добавить в корзину
            </button>
          </div>
        </div>
      </div>
    </>
  );
}