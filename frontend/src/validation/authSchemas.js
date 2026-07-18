import { z } from "zod";

/* ===========================
   SHARED FIELD RULES
=========================== */

const nameField = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(80, "Name is too long")
  .regex(/^[a-zA-Z][a-zA-Z\s.'-]*$/, "Name can only contain letters, spaces, . ' -");

const emailField = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address");

const phoneField = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number");

// Strong password: 8+ chars, upper, lower, number, special char
const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password is too long")
  .regex(/[a-z]/, "Add at least one lowercase letter")
  .regex(/[A-Z]/, "Add at least one uppercase letter")
  .regex(/[0-9]/, "Add at least one number")
  .regex(/[^a-zA-Z0-9]/, "Add at least one special character");

/* ===========================
   LOGIN
=========================== */

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional()
});

/* ===========================
   REGISTER
=========================== */

export const registerSchema = z
  .object({
    fullname: nameField,
    email: emailField,
    phone: phoneField,
    password: passwordField,
    confirmPassword: z.string().min(1, "Please confirm your password")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

/* ===========================
   FORGOT PASSWORD
=========================== */

export const forgotPasswordSchema = z.object({
  email: emailField
});

/* ===========================
   RESET PASSWORD
=========================== */

export const resetPasswordSchema = z
  .object({
    password: passwordField,
    confirmPassword: z.string().min(1, "Please confirm your password")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

/* ===========================
   PASSWORD STRENGTH HELPER
=========================== */

export const getPasswordStrength = (password = "") => {
  if (!password) return { score: 0, label: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const levels = [
    { label: "Very Weak", color: "#e63946" },
    { label: "Weak", color: "#f4a261" },
    { label: "Fair", color: "#e9c46a" },
    { label: "Good", color: "#8ab17d" },
    { label: "Strong", color: "#2a9d8f" },
    { label: "Very Strong", color: "#1d7a6f" }
  ];

  const clamped = Math.min(score, levels.length - 1);
  return { score: clamped, ...levels[clamped] };
};
