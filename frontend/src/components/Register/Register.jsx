import { useState } from "react";
import "./Register.css";
import { api, setToken } from "../api";

export default function Register({ onAuthed, goLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const res = await api.register({ username, email, password });
      if (res?.token) setToken(res.token);
      onAuthed?.(res?.user);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="authWrap">
      <div className="authCard">
        <h2>Регистрация</h2>
        <form className="authForm" onSubmit={submit}>
          <input placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button disabled={busy}>{busy ? "..." : "Создать аккаунт"}</button>
        </form>

        {err && <p className="err">{err}</p>}

        <p className="hint">
          Уже есть аккаунт?{" "}
          <button className="linkBtn" type="button" onClick={goLogin}>
            Войти
          </button>
        </p>
      </div>
    </div>
  );
}