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
