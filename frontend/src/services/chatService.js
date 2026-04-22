import api from './api';

const chatService = {
  getMyChats: () =>
    api.get('/chat/my-chats').then((r) => r.data),

  getMessages: (bookingId) =>
    api.get(`/chat/booking/${bookingId}`).then((r) => r.data),

  sendMessage: (bookingId, text, image = null) =>
    api.post(`/chat/booking/${bookingId}`, { text, image }).then((r) => r.data),

  getUnreadCount: () =>
    api.get('/chat/unread-count').then((r) => r.data),
};

export default chatService;
