import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Send, MessageSquare, ArrowLeft, CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import chatService from '../../services/chatService';

const fmt = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export default function GuideChat() {
  const { user }              = useAuth();
  const { bookingId }         = useParams();
  const navigate              = useNavigate();
  const [chats, setChats]     = useState([]);
  const [messages, setMsgs]   = useState([]);
  const [text, setText]       = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeChat, setActiveChat] = useState(bookingId || null);
  const bottomRef             = useRef(null);
  const pollRef               = useRef(null);

  // Load chat list
  useEffect(() => {
    chatService.getMyChats()
      .then((d) => { setChats(d.chats || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Load messages for active chat + poll every 5s
  useEffect(() => {
    if (!activeChat) return;
    const load = () =>
      chatService.getMessages(activeChat)
        .then((d) => setMsgs(d.messages || []))
        .catch(console.error);
    load();
    pollRef.current = setInterval(load, 5000);
    return () => clearInterval(pollRef.current);
  }, [activeChat]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeChat || sending) return;
    setSending(true);
    try {
      const d = await chatService.sendMessage(activeChat, text.trim());
      setMsgs((prev) => [...prev, d.message]);
      setText('');
    } catch {}
    finally { setSending(false); }
  };

  const openChat = (bId) => {
    setActiveChat(bId);
    navigate(`/guide/chat/${bId}`, { replace: true });
  };

  const activeBooking = chats.find((c) => c.booking._id === activeChat);
  const otherParty = activeBooking
    ? (activeBooking.booking.guide?._id === user?._id
        ? activeBooking.booking.user
        : activeBooking.booking.guide)
    : null;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 48, color: '#6b7280' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #d1fae5', borderTop: '3px solid #16a34a', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 12px' }} />
        Loading messages…
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 130px)', background: '#fff', borderRadius: 16, border: '1px solid #e5f0e8', overflow: 'hidden' }}>

      {/* ── Chat list panel ── */}
      <div style={{
        width: 280, borderRight: '1px solid #e5f0e8',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid #e5f0e8' }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#0a2818' }}>Messages</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Accepted bookings only</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: '#9ca3af', fontSize: 13 }}>
              <MessageSquare size={28} style={{ margin: '0 auto 8px', display: 'block', color: '#d1fae5' }} />
              No active chats yet.<br />
              Accept a booking to start chatting.
            </div>
          ) : (
            chats.map(({ booking, lastMessage, unreadCount }) => {
              const other = booking.guide?._id === user?._id ? booking.user : booking.guide;
              const isActive = activeChat === booking._id;
              return (
                <button
                  key={booking._id}
                  onClick={() => openChat(booking._id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    width: '100%', padding: '14px 18px', border: 'none',
                    background: isActive ? '#f0fdf4' : 'transparent',
                    borderLeft: isActive ? '3px solid #16a34a' : '3px solid transparent',
                    cursor: 'pointer', textAlign: 'left',
                    borderBottom: '1px solid #f8faf8',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', background: '#16a34a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0, overflow: 'hidden',
                  }}>
                    {other?.profileImage
                      ? <img src={other.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : (other?.firstName?.[0] || 'T').toUpperCase()
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0a2818', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {other?.firstName || other?.username}
                      </span>
                      {lastMessage && <span style={{ fontSize: 10, color: '#9ca3af' }}>{fmtDate(lastMessage.createdAt)}</span>}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>
                      {lastMessage ? lastMessage.text : booking.destination?.name || 'Booking chat'}
                    </div>
                  </div>
                  {unreadCount > 0 && (
                    <span style={{ background: '#16a34a', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 20, flexShrink: 0 }}>
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Message area ── */}
      {!activeChat ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
          <MessageSquare size={48} color="#d1fae5" />
          <div style={{ fontWeight: 700, color: '#0a2818', marginTop: 12, fontSize: 15 }}>Select a conversation</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Choose from your active bookings on the left.</div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Chat header */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #e5f0e8', display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => { setActiveChat(null); navigate('/guide/chat', { replace: true }); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
              <ArrowLeft size={18} color="#6b7280" />
            </button>
            {otherParty && (
              <>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0, overflow: 'hidden' }}>
                  {otherParty?.profileImage
                    ? <img src={otherParty.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (otherParty?.firstName?.[0] || 'T').toUpperCase()
                  }
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#0a2818', fontSize: 14 }}>{otherParty?.firstName || otherParty?.username}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>
                    {activeBooking?.booking?.destination?.name || 'Booking chat'}
                    {' · '}
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>
                      {activeBooking?.booking?.status}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, padding: '40px 0' }}>
                No messages yet. Say hello! 👋
              </div>
            ) : (
              messages.map((m, i) => {
                const isMine = m.sender?._id === user?._id || m.sender === user?._id;
                const showDate = i === 0 || fmtDate(messages[i - 1].createdAt) !== fmtDate(m.createdAt);
                return (
                  <div key={m._id}>
                    {showDate && (
                      <div style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', margin: '8px 0', fontWeight: 600 }}>
                        {fmtDate(m.createdAt)}
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
                      {!isMine && (
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#16a34a', flexShrink: 0 }}>
                          {(m.sender?.firstName?.[0] || 'T').toUpperCase()}
                        </div>
                      )}
                      <div style={{
                        maxWidth: '70%', padding: '10px 14px', borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: isMine ? '#16a34a' : '#f0fdf4',
                        color: isMine ? '#fff' : '#0a2818',
                        fontSize: 14, lineHeight: 1.5,
                      }}>
                        {m.text}
                        <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                          {fmt(m.createdAt)}
                          {isMine && <CheckCheck size={12} style={{ opacity: m.isRead ? 1 : 0.5 }} />}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{ padding: '12px 20px', borderTop: '1px solid #e5f0e8', display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message…"
              style={{
                flex: 1, padding: '10px 16px', border: '1.5px solid #d1fae5',
                borderRadius: 24, fontSize: 14, outline: 'none', fontFamily: 'inherit',
                transition: 'border 0.15s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#16a34a'}
              onBlur={(e) => e.target.style.borderColor = '#d1fae5'}
            />
            <button
              type="submit"
              disabled={!text.trim() || sending}
              style={{
                width: 42, height: 42, borderRadius: '50%',
                background: text.trim() && !sending ? '#16a34a' : '#d1fae5',
                border: 'none', cursor: text.trim() && !sending ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s', flexShrink: 0,
              }}
            >
              <Send size={18} color={text.trim() && !sending ? '#fff' : '#9ca3af'} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
