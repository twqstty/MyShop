import { useState } from "react";
import "./Login.css";
import { api, setToken } from "../api";

export default function Login({ onAuthed, goRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const res = await api.login({ email, password });
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
        <h2>Вход</h2>
        <form className="authForm" onSubmit={submit}>
          <input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button disabled={busy}>{busy ? "..." : "Войти"}</button>
        </form>

        {err && <p className="err">{err}</p>}

        <p className="hint">
          Нет аккаунта?{" "}
          <button className="linkBtn" type="button" onClick={goRegister}>
            Регистрация
          </button>
        </p>
      </div>
    </div>
  );
}