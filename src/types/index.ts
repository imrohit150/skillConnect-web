export type User = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  bio?: string;
  skills?: string[];
  profileImageUrl?: string;
  premiumStatus?: boolean;
};

export type Membership = {
  premiumStatus: boolean;
  premiumUntil: string | null;
  subscription: { status: string; currentPeriodEnd: string | null } | null;
};

export type CheckoutSubscription = {
  subscriptionId: string;
  keyId: string;
};

export type PaymentConfirmation = {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
};

export type LoginInput = { email: string; password: string };
export type SignupInput = LoginInput & { name: string; dateOfBirth: string };

export type ExperienceLevel = "Beginner" | "Intermediate" | "Advanced";

export type Profile = {
  name: string;
  email: string;
  profileImageUrl?: string;
  bio?: string;
  skills?: string[];
  experienceLevel?: ExperienceLevel;
  interests?: string[];
  socialLinks?: { github?: string; linkedin?: string; portfolio?: string };
  premiumStatus?: boolean;
};

export type ProfileUpdate = Partial<Omit<Profile, "email" | "premiumStatus">>;

export type PublicUser = {
  _id: string;
  name: string;
  bio?: string;
  skills?: string[];
  profileImageUrl?: string;
  premiumStatus?: boolean;
  interests?: string[];
  experienceLevel?: ExperienceLevel;
  socialLinks?: { github?: string; linkedin?: string; portfolio?: string };
};

export type ReceivedRequest = {
  _id: string;
  senderId: PublicUser;
  createdAt: string;
};

export type SentRequest = {
  _id: string;
  recipientId: PublicUser;
  createdAt: string;
};

export type UserFilters = {
  search?: string;
  experienceLevel?: ExperienceLevel;
};

export type UsersPage = {
  users: PublicUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };
};

export type Connection = {
  connectionId: string;
  connectedAt: string;
  user: PublicUser;
};

export type PassedUser = {
  _id: string;
  passedUserId: PublicUser;
  createdAt: string;
};
