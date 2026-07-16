import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiMail } from "react-icons/fi";

import { forgotPassword } from "../services/api";
import { forgotPasswordSchema } from "../validation/authSchemas";

import AuthCard from "../components/auth/AuthCard";
import AuthInput from "../components/auth/AuthInput";
import AuthSubmitButton from "../components/auth/AuthSubmitButton";
import FormMessage from "../components/auth/FormMessage";

const ForgotPassword = () => {
  const [serverMessage, setServerMessage] = useState({ type: "", text: "" });
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
    defaultValues: { email: "" }
  });

  const onSubmit = async ({ email }) => {
    setServerMessage({ type: "", text: "" });

    try {
      const data = await forgotPassword(email);

      // Always show a generic success message so we never reveal
      // whether an email exists in the system (security best practice).
      if (data.success === false && data.message?.toLowerCase().includes("server")) {
        setServerMessage({
          type: "error",
          text: "Unable to reach the server. Please try again."
        });
        return;
      }

      setSubmitted(true);
      setServerMessage({
        type: "success",
        text: "If an account exists for that email, a reset link has been sent."
      });
    } catch (error) {
      setServerMessage({
        type: "error",
        text: "Unable to reach the server. Please try again."
      });
    }
  };

  return (
    <AuthCard
      eyebrow="Account recovery"
      title="Forgot Password"
      subtitle="Enter your email and we'll send you a reset link"
    >
      {!submitted && (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <AuthInput
            id="forgot-email"
            label="Email address"
            type="email"
            icon={FiMail}
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />

          <FormMessage type={serverMessage.type}>{serverMessage.text}</FormMessage>

          <AuthSubmitButton loading={isSubmitting}>Send reset link</AuthSubmitButton>
        </form>
      )}

      {submitted && <FormMessage type="success">{serverMessage.text}</FormMessage>}

      <p className="auth-switch">
        Remembered your password?{" "}
        <Link to="/login" className="auth-link">
          Back to Login
        </Link>
      </p>
    </AuthCard>
  );
};

export default ForgotPassword;
