export const API_ROUTES = {
  payments: {
    subscription: "/payments/subscription",
    me: "/payments/subscription/me",
    verify: "/payments/verify",
  },
  auth: {
    signup: "/auth/signup",
    pendingSignup: "/auth/signup/pending",
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    me: "/auth/me",
    verifyEmail: "/auth/email-verification/verify",
    resendVerification: "/auth/email-verification/resend",
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
  conversations: {
    list: "/conversations",
    create: (userId: string) => `/conversations/${userId}`,
    messages: (conversationId: string) => `/conversations/${conversationId}/messages`,
  },
} as const;
