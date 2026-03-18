import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken, setUserData } from "../api";
import "./ProfilePage.css";

export default function ProfilePage({ user, onUserUpdate }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const avatarKey = user ? `avatar_${user.id}` : null;

  const [avatarPreview, setAvatarPreview] = useState(
    avatarKey ? localStorage.getItem(avatarKey) || "" : ""
  );
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        username: user.username || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!avatarKey) return;
    setAvatarPreview(localStorage.getItem(avatarKey) || "");
  }, [avatarKey]);
  function change(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file || !avatarKey) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      setAvatarPreview(result);
      localStorage.setItem(avatarKey, result);
    };
    reader.readAsDataURL(file);
  }

  function removeAvatar() {
    if (!avatarKey) return;
    setAvatarPreview("");
    localStorage.removeItem(avatarKey);
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setBusy(true);

    try {
      const payload = {
        username: form.username,
        email: form.email,
        password: form.password,
      };

      const res = await api.updateProfile(payload);

      if (res.token) {
        setToken(res.token);
      }

      if (res.user) {
        setUserData(res.user);
        onUserUpdate?.(res.user);
      }

      setForm((prev) => ({ ...prev, password: "" }));
      setMsg("Профиль успешно обновлен");
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  const avatarLetter = useMemo(() => {
    return (form.username || form.email || "U")[0]?.toUpperCase();
  }, [form.username, form.email]);

  return (
    <div className="profilePage">
      <button className="profilePage__back" onClick={() => navigate("/")} type="button">
        ← Назад в магазин
      </button>

      <div className="profilePage__card">
        <div className="profilePage__left">
          <h2 className="profilePage__title">Изменить профиль</h2>
          <p className="profilePage__sub">Обновите свои данные аккаунта.</p>

          <form className="profileForm" onSubmit={submit}>
            <div className="profileField">
              <label>Имя пользователя</label>
              <input
                name="username"
                value={form.username}
                onChange={change}
                placeholder="Введите username"
              />
            </div>

            <div className="profileField">
              <label>Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={change}
                placeholder="Введите email"
              />
            </div>

            <div className="profileField">
              <label>Новый пароль</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={change}
                placeholder="qwerty123 (оставьте пустым, чтобы не менять)"
              />
            </div>

            <div className="profileActions">
              <button className="profileBtn profileBtn--primary" type="submit" disabled={busy}>
                {busy ? "Сохранение..." : "Сохранить изменения"}
              </button>
            </div>

            {msg && <p className="profileMsg">{msg}</p>}
            {err && <p className="profileErr">{err}</p>}
          </form>
        </div>

        <div className="profilePage__right">
          <h3 className="profilePage__avatarTitle">Аватар</h3>

          <div className="profileAvatarBox">
            {avatarPreview ? (
              <img className="profileAvatarImg" src={avatarPreview} alt="avatar" />
            ) : (
              <div className="profileAvatarFallback">{avatarLetter}</div>
            )}
          </div>

          <label className="profileUploadBtn">
            Выбрать аватар
            <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
          </label>

          {avatarPreview && (
            <button className="profileBtn profileBtn--ghost" onClick={removeAvatar} type="button">
              Удалить аватар
            </button>
          )}
        </div>
      </div>
    </div>
  );
}