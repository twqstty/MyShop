import { useEffect, useRef, useState } from "react";
import { api } from "../api";
import { getSupportSocket } from "../supportSocket";
import "./SupportWidget.css";

const QUICK_REPLIES = [
  "Где мой заказ?",
  "Нужна помощь с оплатой",
  "Хочу уточнить наличие товара",
];

function formatTime(value) {
  if (!value) return "";

  return new Date(value).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSeenMessageId(userId) {
  return Number(localStorage.getItem(`support_seen_${userId}`) || 0);
}

function setSeenMessageId(userId, messageId) {
  localStorage.setItem(`support_seen_${userId}`, String(messageId));
}

export default function SupportWidget({ user }) {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReplyAt, setLastReplyAt] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const messagesRef = useRef(null);

  async function fetchMessages({ silent = false } = {}) {
    try {
      if (!silent) {
        setBusy(true);
      }

      const res = await api.getSupportMessages();
      const nextMessages = res.messages || [];
      const latestMessage = nextMessages[nextMessages.length - 1];
      const lastIncoming = [...nextMessages].reverse().find((message) => message.senderId !== user?.id);
      const seenId = getSeenMessageId(user.id);

      setChat(res.chat || null);
      setMessages(nextMessages);
      setLastReplyAt(lastIncoming?.createdAt || "");
      setUnreadCount(
        open
          ? 0
          : nextMessages.filter((message) => message.senderId !== user?.id && message.id > seenId).length
      );

      if (open && latestMessage) {
        setSeenMessageId(user.id, latestMessage.id);
      }

      setHasLoaded(true);
      setErr("");
    } catch (e) {
      setErr(e.message);
    } finally {
      if (!silent) {
        setBusy(false);
      }
    }
  }

  useEffect(() => {
    if (!user?.id) return;
    fetchMessages({ silent: false });
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || !chat?.id) return;

    const socket = getSupportSocket();
    if (!socket) return;

    function handleMessage(message) {
      if (message.chatId !== chat.id) return;

      setMessages((prev) => {
        if (prev.some((item) => item.id === message.id)) {
          return prev;
        }

        const nextMessages = prev.concat(message);
        const lastIncoming = [...nextMessages].reverse().find((item) => item.senderId !== user.id);
        const seenId = getSeenMessageId(user.id);

        setLastReplyAt(lastIncoming?.createdAt || "");
        setUnreadCount(
          open ? 0 : nextMessages.filter((item) => item.senderId !== user.id && item.id > seenId).length
        );

        return nextMessages;
      });
      setHasLoaded(true);
      setErr("");
    }

    function handleChatUpdate(payload) {
      if (payload.chatId !== chat.id) return;
      setChat((prev) => (prev ? { ...prev, status: payload.status || prev.status } : prev));
    }

    function handleConnect() {
      socket.emit("support:join-chat", chat.id);
    }

    socket.emit("support:join-chat", chat.id);
    socket.on("support:message", handleMessage);
    socket.on("support:chat-updated", handleChatUpdate);
    socket.on("connect", handleConnect);

    return () => {
      socket.emit("support:leave-chat", chat.id);
      socket.off("support:message", handleMessage);
      socket.off("support:chat-updated", handleChatUpdate);
      socket.off("connect", handleConnect);
    };
  }, [chat?.id, open, user?.id]);

  useEffect(() => {
    if (!open || !messages.length || !messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;

    const latestMessage = messages[messages.length - 1];
    if (latestMessage) {
      setSeenMessageId(user.id, latestMessage.id);
      setUnreadCount(0);
    }
  }, [open, messages, user.id]);

  async function handleSubmit(e) {
    e.preventDefault();

    const message = text.trim();
    if (!message) return;

    try {
      setSending(true);
      setErr("");
      await api.sendSupportMessage({ text: message });
      setText("");
    } catch (e) {
      setErr(e.message);
    } finally {
      setSending(false);
    }
  }

  function handleQuickReply(value) {
    setText(value);
    setOpen(true);
  }

  function handleToggle() {
    setOpen((prev) => !prev);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <div className={`supportWidget ${open ? "supportWidget--open" : ""}`}>
      {open && <button className="supportWidget__backdrop" type="button" onClick={() => setOpen(false)} />}

      <section className={`supportWidget__panel ${open ? "supportWidget__panel--visible" : ""}`}>
        <div className="supportWidget__shell">
          <div className="supportWidget__hero">
            <div className="supportWidget__eyebrow">
              <span className="supportWidget__onlineDot"></span>
              Поддержка онлайн
            </div>

            <button
              className="supportWidget__close"
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Закрыть чат"
            >
              ×
            </button>

            <h3>Чем помочь?</h3>
            <p>
              Отвечаем прямо в чате. История сохранится, и вы сможете вернуться к разговору позже.
            </p>

            <div className="supportWidget__meta">
              <div className="supportWidget__metaCard">
                <span className="supportWidget__metaLabel">Обычно отвечаем</span>
                <strong>за 5-10 минут</strong>
              </div>
              <div className="supportWidget__metaCard">
                <span className="supportWidget__metaLabel">Последний ответ</span>
                <strong>{lastReplyAt ? formatTime(lastReplyAt) : "Пока нет"}</strong>
              </div>
            </div>
          </div>

          <div className="supportWidget__quickReplies">
            {QUICK_REPLIES.map((item) => (
              <button
                key={item}
                className="supportWidget__chip"
                type="button"
                onClick={() => handleQuickReply(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {err && <div className="supportWidget__error">{err}</div>}

          <div className="supportWidget__messages" ref={messagesRef}>
            {!hasLoaded || busy ? (
              <>
                <div className="supportWidget__skeleton supportWidget__skeleton--left"></div>
                <div className="supportWidget__skeleton supportWidget__skeleton--right"></div>
                <div className="supportWidget__skeleton supportWidget__skeleton--left supportWidget__skeleton--short"></div>
              </>
            ) : messages.length ? (
              messages.map((message) => {
                const isMine = message.senderId === user?.id;

                return (
                  <article
                    key={message.id}
                    className={`supportWidget__message ${isMine ? "supportWidget__message--mine" : ""}`}
                  >
                    <div className="supportWidget__author">
                      {isMine ? "Вы" : message.sender?.username || message.sender?.email || "Поддержка"}
                    </div>
                    <div className="supportWidget__text">{message.text}</div>
                    <div className="supportWidget__time">{formatTime(message.createdAt)}</div>
                  </article>
                );
              })
            ) : (
              <div className="supportWidget__empty">
                <div className="supportWidget__emptyBadge">Новый диалог</div>
                <strong>Начните чат с поддержкой</strong>
                <p>Опишите вопрос по заказу, оплате или товару. Мы увидим сообщение в админке сразу после отправки.</p>
              </div>
            )}
          </div>

          <form className="supportWidget__form" onSubmit={handleSubmit}>
            <div className="supportWidget__composer">
              <textarea
                className="supportWidget__input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Напишите сообщение..."
                rows={1}
              />
              <button
                className="supportWidget__send"
                type="submit"
                disabled={sending || !text.trim()}
                aria-label="Отправить сообщение"
              >
                <span className="supportWidget__sendIcon">➜</span>
              </button>
            </div>

            <div className="supportWidget__hint">Enter отправляет, Shift + Enter переносит строку</div>
          </form>
        </div>
      </section>

      <button
        className={`supportWidget__launcher ${open ? "supportWidget__launcher--active" : ""}`}
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        aria-label="Открыть чат поддержки"
      >
        <span className="supportWidget__launcherGlow"></span>
        <span className="supportWidget__launcherIcon">
          <span className="supportWidget__launcherBubble"></span>
        </span>
        <span className="supportWidget__launcherText">
          <strong>Поддержка</strong>
          <small>Мы онлайн</small>
        </span>
        {unreadCount > 0 && <span className="supportWidget__badge">{unreadCount}</span>}
      </button>
    </div>
  );
}
