import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import { api } from "../api";
import { getSupportSocket } from "../supportSocket";
import "./SupportPage.css";

function formatTime(value) {
  if (!value) return "";

  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SupportPage({
  user,
  onLogout,
  cartCount,
  theme,
  onToggleTheme,
  favoritesCount,
}) {
  const navigate = useNavigate();
  const isAdmin = user?.role === "ADMIN";

  const [chat, setChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(true);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");

  const selectedChat = useMemo(() => {
    if (!isAdmin) return chat;
    return chats.find((item) => item.id === selectedChatId) || null;
  }, [chat, chats, isAdmin, selectedChatId]);

  async function loadUserChat() {
    const [chatRes, messagesRes] = await Promise.all([
      api.getSupportChat(),
      api.getSupportMessages(),
    ]);

    setChat(chatRes.chat);
    setMessages(messagesRes.messages || []);
  }

  async function loadAdminChats() {
    const res = await api.getAdminSupportChats();
    const nextChats = res.chats || [];
    setChats(nextChats);

    const nextChatId =
      nextChats.some((item) => item.id === selectedChatId)
        ? selectedChatId
        : nextChats[0]?.id || null;

    setSelectedChatId(nextChatId);

    if (nextChatId) {
      const details = await api.getAdminSupportMessages(nextChatId);
      setChat(details.chat);
      setMessages(details.messages || []);
    } else {
      setChat(null);
      setMessages([]);
    }
  }

  async function loadChatData() {
    try {
      setErr("");
      setBusy(true);

      if (isAdmin) {
        await loadAdminChats();
      } else {
        await loadUserChat();
      }
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!user) return;
    loadChatData();
  }, [user, isAdmin]);

  useEffect(() => {
    if (!user) return;

    const socket = getSupportSocket();
    if (!socket) return;

    function handleMessage(message) {
      if (isAdmin) {
        if (message.chatId === selectedChatId) {
          setMessages((prev) => (prev.some((item) => item.id === message.id) ? prev : prev.concat(message)));
        }

        api.getAdminSupportChats()
          .then((res) => setChats(res.chats || []))
          .catch(() => {});
        return;
      }

      setMessages((prev) => (prev.some((item) => item.id === message.id) ? prev : prev.concat(message)));
    }

    function handleChatUpdate(payload) {
      if (isAdmin) {
        api.getAdminSupportChats()
          .then((res) => setChats(res.chats || []))
          .catch(() => {});

        if (payload.chatId === selectedChatId) {
          setChat((prev) => (prev ? { ...prev, status: payload.status || prev.status } : prev));
        }

        return;
      }

      if (payload.chatId === chat?.id) {
        setChat((prev) => (prev ? { ...prev, status: payload.status || prev.status } : prev));
      }
    }

    function handleConnect() {
      const roomId = selectedChatId || chat?.id;
      if (roomId) {
        socket.emit("support:join-chat", roomId);
      }
    }

    socket.on("support:message", handleMessage);
    socket.on("support:chat-updated", handleChatUpdate);
    socket.on("connect", handleConnect);

    return () => {
      socket.off("support:message", handleMessage);
      socket.off("support:chat-updated", handleChatUpdate);
      socket.off("connect", handleConnect);
    };
  }, [user, isAdmin, selectedChatId, chat?.id]);

  useEffect(() => {
    if (!user) return;

    const socket = getSupportSocket();
    const roomId = isAdmin ? selectedChatId : chat?.id;

    if (!socket || !roomId) return;

    socket.emit("support:join-chat", roomId);

    return () => {
      socket.emit("support:leave-chat", roomId);
    };
  }, [user, isAdmin, selectedChatId, chat?.id]);

  async function handleSelectChat(chatId) {
    setSelectedChatId(chatId);
    setBusy(true);
    setErr("");

    try {
      const details = await api.getAdminSupportMessages(chatId);
      setChat(details.chat);
      setMessages(details.messages || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const message = text.trim();
    if (!message) return;

    setSending(true);
    setErr("");

    try {
      if (isAdmin) {
        if (!selectedChatId) return;
        await api.sendAdminSupportMessage(selectedChatId, { text: message });
        const chatsRes = await api.getAdminSupportChats();
        setChats(chatsRes.chats || []);
      } else {
        await api.sendSupportMessage({ text: message });
      }

      setText("");
    } catch (e) {
      setErr(e.message);
    } finally {
      setSending(false);
    }
  }

  async function handleToggleStatus() {
    if (!isAdmin || !selectedChat) return;

    const nextStatus = selectedChat.status === "OPEN" ? "CLOSED" : "OPEN";

    try {
      setErr("");
      await api.updateSupportChatStatus(selectedChat.id, { status: nextStatus });
      await loadAdminChats();
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

      <div className="supportPage">
        <div className={`supportPage__top ${isAdmin ? "supportPage__top--admin" : ""}`}>
          <button className="supportPage__back" type="button" onClick={() => navigate("/")}>
            ← Назад в магазин
          </button>
          <div className="supportPage__hero">
            <h1>{isAdmin ? "Поддержка клиентов" : "Чат поддержки"}</h1>
            <p>
              {isAdmin
                ? "Отвечайте клиентам прямо из админского интерфейса."
                : "Напишите нам, и сообщение сразу сохранится в базе данных."}
            </p>

            {isAdmin && (
              <div className="supportPage__stats">
                <div className="supportPage__stat">
                  <span className="supportPage__statLabel">Всего диалогов</span>
                  <strong>{chats.length}</strong>
                </div>
                <div className="supportPage__stat">
                  <span className="supportPage__statLabel">Открыто</span>
                  <strong>{chats.filter((item) => item.status === "OPEN").length}</strong>
                </div>
                <div className="supportPage__stat">
                  <span className="supportPage__statLabel">Закрыто</span>
                  <strong>{chats.filter((item) => item.status === "CLOSED").length}</strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {err && <div className="supportPage__error">{err}</div>}

        <div className={`supportLayout ${isAdmin ? "supportLayout--admin" : ""}`}>
          {isAdmin && (
            <aside className="supportSidebar">
              <div className="supportSidebar__head">
                <div>
                  <h2>Диалоги</h2>
                  <p>Выберите чат и ответьте клиенту</p>
                </div>
                <span className="supportSidebar__count">{chats.length}</span>
              </div>

              <div className="supportSidebar__list">
                {chats.map((item) => {
                  const lastMessage = item.messages?.[0];

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`supportChatCard ${selectedChatId === item.id ? "supportChatCard--active" : ""}`}
                      onClick={() => handleSelectChat(item.id)}
                    >
                      <div className="supportChatCard__row">
                        <div className="supportChatCard__identity">
                          <span className="supportChatCard__avatar">
                            {(item.user?.username || item.user?.email || "?")[0]?.toUpperCase()}
                          </span>
                          <strong>{item.user?.username || item.user?.email}</strong>
                        </div>
                        <span className={`supportStatus supportStatus--${item.status?.toLowerCase()}`}>
                          {item.status === "OPEN" ? "Открыт" : "Закрыт"}
                        </span>
                      </div>
                      <div className="supportChatCard__meta">{item.user?.email}</div>
                      <div className="supportChatCard__preview">
                        {lastMessage?.text || "Сообщений пока нет"}
                      </div>
                      <div className="supportChatCard__meta">
                        {item._count?.messages || 0} сообщений • {formatTime(item.lastMessageAt)}
                      </div>
                    </button>
                  );
                })}

                {!chats.length && !busy && (
                  <div className="supportSidebar__empty">Чатов пока нет.</div>
                )}
              </div>
            </aside>
          )}

          <section className="supportDialog">
            <div className="supportDialog__head">
              <div>
                <h2>
                  {isAdmin
                    ? selectedChat
                      ? `${selectedChat.user?.username || selectedChat.user?.email}`
                      : "Выберите чат"
                    : "Диалог с поддержкой"}
                </h2>
                <p>
                  {selectedChat
                    ? selectedChat.user?.email || `Чат #${selectedChat.id}`
                    : "После первого сообщения диалог появится в админке."}
                </p>
              </div>

              <div className="supportDialog__actions">
                {isAdmin && selectedChat && (
                  <>
                    <div className={`supportDialog__status supportDialog__status--${selectedChat.status?.toLowerCase()}`}>
                      {selectedChat.status === "OPEN" ? "Чат активен" : "Чат закрыт"}
                    </div>
                    <button className="supportDialog__toggle" type="button" onClick={handleToggleStatus}>
                      {selectedChat.status === "OPEN" ? "Закрыть чат" : "Открыть чат"}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="supportMessages">
              {busy ? (
                <div className="supportMessages__empty">Загрузка сообщений...</div>
              ) : messages.length ? (
                messages.map((message) => {
                  const isMine = message.senderId === user?.id;

                  return (
                    <div
                      key={message.id}
                      className={`supportMessage ${isMine ? "supportMessage--mine" : ""}`}
                    >
                      <div className="supportMessage__author">
                        {isMine ? "Вы" : message.sender?.username || message.sender?.email || "Поддержка"}
                      </div>
                      <div className="supportMessage__text">{message.text}</div>
                      <div className="supportMessage__time">{formatTime(message.createdAt)}</div>
                    </div>
                  );
                })
              ) : (
                <div className="supportMessages__empty">
                  Сообщений пока нет. Напишите первым.
                </div>
              )}
            </div>

            <form className="supportComposer" onSubmit={handleSubmit}>
              <textarea
                className="supportComposer__input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Введите сообщение..."
                rows={4}
                disabled={isAdmin && !selectedChat}
              />
              <button
                className="supportComposer__send"
                type="submit"
                disabled={sending || (isAdmin && !selectedChat)}
              >
                {sending ? "Отправка..." : "Отправить"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </>
  );
}
