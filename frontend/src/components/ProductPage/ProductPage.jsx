import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProductPage.css";
import Header from "../Header/Header";
import { flyToCart } from "../flyToCart";
import { api } from "../api";

export default function ProductPage({ user, onLogout, cartCount, onAdd }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const imgRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setErr("");
        setBusy(true);
        const res = await api.getProduct(id);
        if (!alive) return;
        setProduct(res.product);
      } catch (e) {
        if (!alive) return;
        setErr(e.message);
      } finally {
        if (!alive) return;
        setBusy(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  function addHere() {
    if (!product) return;

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

        {busy && <p>Загрузка…</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {product && (
          <div className="pp__card">
            <div className="pp__imageWrap">
              <img ref={imgRef} src={product.image} alt={product.name} />
            </div>

            <div className="pp__info">
              <h1>{product.name}</h1>
              <p className="pp__desc">{product.desc}</p>
              <div className="pp__price">{Number(product.price).toFixed(2)} €</div>

              <button className="pp__btn" onClick={addHere}>
                Добавить в корзину
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}