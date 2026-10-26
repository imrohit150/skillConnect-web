export const API_ROUTES = {
  auth: {
    signup: "/auth/signup",
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    me: "/auth/me",
  },
  profile: {
    me: "/profile/me",
    byId: (userId: string) => `/profile/${userId}`,
    image: "/profile/me/image",
  },
  users: {
    list: "/users",
    pass: (userId: string) => `/users/${userId}/pass`,
    passed: "/users/passed",
  },
  connections: {
    list: "/connections",
    remove: (userId: string) => `/connections/${userId}`,
    request: (userId: string) => `/connections/${userId}/request`,
    received: "/connections/requests/received",
    sent: "/connections/requests/sent",
    accept: (requestId: string) => `/connections/requests/${requestId}/accept`,
    ignore: (requestId: string) => `/connections/requests/${requestId}/ignore`,
    cancel: (requestId: string) => `/connections/requests/${requestId}/cancel`,
  },
} as const;
