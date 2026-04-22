import api from './api';

const notificationService = {
  getAll: () =>
    api.get('/notifications').then((r) => r.data),

  getUnreadCount: () =>
    api.get('/notifications/unread-count').then((r) => r.data),

  markRead: (id) =>
    api.put(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: () =>
    api.put('/notifications/read-all').then((r) => r.data),

  delete: (id) =>
    api.delete(`/notifications/${id}`).then((r) => r.data),
};

export default notificationService;
