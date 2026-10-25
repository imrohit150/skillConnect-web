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
  },
  connections: {
    received: "/connections/requests/received",
    sent: "/connections/requests/sent",
    accept: (requestId: string) => `/connections/requests/${requestId}/accept`,
    ignore: (requestId: string) => `/connections/requests/${requestId}/ignore`,
    cancel: (requestId: string) => `/connections/requests/${requestId}/cancel`,
  },
} as const;
