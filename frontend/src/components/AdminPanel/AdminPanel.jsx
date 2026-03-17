import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import "./AdminPanel.css";

export default function AdminPanel() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    image: "",
    desc: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [imageFile, setImageFile] = useState(null);

  async function loadProducts() {
    try {
      const data = await api.getProducts();
      setProducts(data.products);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function change(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setErr("");

    try {
      if (editingId) {
        await api.updateProduct(editingId, form);
        setMsg("Товар обновлен");
      } else {
        await api.createProduct(form);
        setMsg("Товар добавлен");
      }

      setForm({
        name: "",
        price: "",
        image: "",
        desc: "",
      });

      setEditingId(null);

      await loadProducts();
    } catch (e) {
      setErr(e.message);
    }
  }

  function editProduct(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: product.price,
      image: product.image,
      desc: product.desc,
    });
  }

  async function deleteProduct(id) {
    if (!window.confirm("Удалить товар?")) return;

    try {
      await api.deleteProduct(id);
      setMsg("Товар удален");
      await loadProducts();
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="adminPanel">
      <button className="adminPanel__back" onClick={() => navigate("/")} type="button">
        ← Назад в магазин
      </button>

      <h2>Админ-панель</h2>

      <form className="adminPanel__form" onSubmit={submit}>
        <input
          name="name"
          placeholder="Название"
          value={form.name}
          onChange={change}
        />

        <input
          name="price"
          placeholder="Цена"
          value={form.price}
          onChange={change}
        />

        <input
          name="image"
          placeholder="/products/example.jpg"
          value={form.image}
          onChange={change}
        />

        <input
          name="desc"
          placeholder="Описание"
          value={form.desc}
          onChange={change}
        />

        <button type="submit">
          {editingId ? "Обновить товар" : "Добавить товар"}
        </button>
      </form>

      {msg && <p className="adminPanel__msg">{msg}</p>}
      {err && <p className="adminPanel__err">{err}</p>}

      <h3 style={{ marginTop: 30 }}>Все товары</h3>

      <div className="adminPanel__list">
        {products.map((p) => (
          <div key={p.id} className="adminProduct">
            <img src={p.image} alt={p.name} />

            <div className="adminProduct__info">
              <b>{p.name}</b>
              <div>{p.price} €</div>
            </div>

            <div className="adminProduct__actions">
              <button onClick={() => editProduct(p)}>✏️</button>
              <button onClick={() => deleteProduct(p.id)}>🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}