import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import { api } from "../api";
import "./PostsPage.css";

const INITIAL_FORM = {
  title: "",
  content: "",
};

export default function PostsPage({
  user,
  onLogout,
  cartCount,
  theme,
  onToggleTheme,
  favoritesCount,
}) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let alive = true;

    const loadPosts = async () => {
      try {
        setBusy(true);
        setErr("");
        const res = await api.getPosts();
        if (alive) {
          setPosts(res.posts || []);
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

    loadPosts();

    return () => {
      alive = false;
    };
  }, []);

  function change(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setForm(INITIAL_FORM);
    setEditingId(null);
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setSaving(true);

    try {
      if (editingId) {
        const res = await api.updatePost(editingId, form);
        setPosts((prev) =>
          prev.map((post) => (post.id === editingId ? { ...post, ...res.post } : post))
        );
        setMsg("Пост обновлен");
      } else {
        const res = await api.createPost(form);
        const created = await api.getPost(res.post.id);
        setPosts((prev) => [created.post, ...prev]);
        setMsg("Пост создан");
      }

      resetForm();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(post) {
    setEditingId(post.id);
    setForm({
      title: post.title || "",
      content: post.content || "",
    });
    setMsg("");
    setErr("");
  }

  async function removePost(id) {
    if (!window.confirm("Удалить пост?")) return;

    try {
      setErr("");
      setMsg("");
      await api.deletePost(id);
      setPosts((prev) => prev.filter((post) => post.id !== id));
      if (editingId === id) {
        resetForm();
      }
      setMsg("Пост удален");
    } catch (e) {
      setErr(e.message);
    }
  }

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

      <main className="postsPage">
        <div className="postsPage__inner">
          <button className="postsPage__back" onClick={() => navigate("/")} type="button">
            ← Назад в магазин
          </button>

          <section className="postsPage__formCard">
            <div className="postsPage__head">
              <div>
                <h1 className="postsPage__title">Посты</h1>
                <p className="postsPage__sub">Простой CRUD для проверки API и авторизации.</p>
              </div>
            </div>

            <form className="postsForm" onSubmit={submit}>
              <input
                className="postsForm__input"
                name="title"
                value={form.title}
                onChange={change}
                placeholder="Заголовок поста"
              />

              <textarea
                className="postsForm__textarea"
                name="content"
                value={form.content}
                onChange={change}
                placeholder="Текст поста"
                rows={5}
              />

              <div className="postsForm__actions">
                <button className="postsForm__submit" disabled={saving}>
                  {saving ? "Сохранение..." : editingId ? "Обновить пост" : "Создать пост"}
                </button>

                {editingId && (
                  <button className="postsForm__cancel" onClick={resetForm} type="button">
                    Отмена
                  </button>
                )}
              </div>
            </form>

            {msg && <p className="postsPage__msg">{msg}</p>}
            {err && <p className="postsPage__err">{err}</p>}
          </section>

          <section className="postsPage__list">
            {busy && <p className="postsPage__status">Загрузка постов...</p>}

            {!busy && posts.length === 0 && (
              <p className="postsPage__status">Пока постов нет. Создай первый.</p>
            )}

            {posts.map((post) => {
              const isOwner = post.author?.id === user?.id;

              return (
                <article key={post.id} className="postCard">
                  <div className="postCard__top">
                    <div>
                      <h2 className="postCard__title">{post.title}</h2>
                      <p className="postCard__meta">
                        Автор: {post.author?.username || post.author?.email || "Unknown"}
                      </p>
                    </div>

                    {isOwner && (
                      <div className="postCard__actions">
                        <button className="postCard__btn" onClick={() => startEdit(post)} type="button">
                          Редактировать
                        </button>
                        <button
                          className="postCard__btn postCard__btn--danger"
                          onClick={() => removePost(post.id)}
                          type="button"
                        >
                          Удалить
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="postCard__content">{post.content || "Без текста"}</p>
                </article>
              );
            })}
          </section>
        </div>
      </main>
    </>
  );
}
