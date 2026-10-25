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
} as const;
