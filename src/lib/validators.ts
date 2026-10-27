import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

function isAtLeast18(date: string) {
  const dob = new Date(date);
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 18);
  return dob <= cutoff;
}

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  dateOfBirth: z.iso
    .date("Enter your date of birth")
    .refine(isAtLeast18, "You must be at least 18 years old"),
});

export type LoginValues = z.infer<typeof loginSchema>;
export const forgotPasswordSchema = z.object({ email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email")) });
export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters").refine((value) => new TextEncoder().encode(value).length <= 72, "Password must be at most 72 UTF-8 bytes"),
  confirmPassword: z.string().min(1, "Confirm your new password"),
}).refine((values) => values.newPassword === values.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type SignupValues = z.infer<typeof signupSchema>;

export const signupFormSchema = signupSchema.extend({
  terms: z.boolean().refine((v) => v, "Please accept the terms to continue"),
});

export type SignupFormValues = z.infer<typeof signupFormSchema>;

const optionalUrl = z.union([z.url("Enter a valid URL"), z.literal("")]);

export const profileFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(300, "Bio can be at most 300 characters"),
  experienceLevel: z.enum(["Beginner", "Intermediate", "Advanced"]),
  github: optionalUrl,
  linkedin: optionalUrl,
  portfolio: optionalUrl,
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
