import "./Toast.css";

export default function Toast({ toast, onClose }) {
  return (
    <div className={`toast ${toast ? "toast--show" : ""}`}>
      <div className="toast__body">
        <div className="toast__title">{toast?.title || "Готово"}</div>
        {toast?.text && <div className="toast__text">{toast.text}</div>}
      </div>

      <button className="toast__x" onClick={onClose} aria-label="Close">
        ✕
      </button>
    </div>
  );
}