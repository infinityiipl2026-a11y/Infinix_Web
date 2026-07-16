import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { resetPassword } from "../services/api";
import { resetPasswordSchema } from "../validation/authSchemas";

import AuthCard from "../components/auth/AuthCard";
import PasswordInput from "../components/auth/PasswordInput";
import PasswordStrengthMeter from "../components/auth/PasswordStrengthMeter";
import AuthSubmitButton from "../components/auth/AuthSubmitButton";
import FormMessage from "../components/auth/FormMessage";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token: tokenFromPath } = useParams();
  const [searchParams] = useSearchParams();
  const token = tokenFromPath || searchParams.get("token") || "";

  const [serverMessage, setServerMessage] = useState({ type: "", text: "" });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
    defaultValues: { password: "", confirmPassword: "" }
  });

  const passwordValue = watch("password");

  const onSubmit = async ({ password }) => {
    setServerMessage({ type: "", text: "" });

    if (!token) {
      setServerMessage({
        type: "error",
        text: "This reset link is invalid or has expired. Please request a new one."
      });
      return;
    }

    try {
      const data = await resetPassword(token, password);

      if (data.success) {
        setServerMessage({
          type: "success",
          text: "Password reset successful! Redirecting to login..."
        });
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setServerMessage({
          type: "error",
          text: data.message || "This reset link is invalid or has expired."
        });
      }
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
      title="Reset Password"
      subtitle="Choose a new, strong password for your account"
    >
      {!token && (
        <FormMessage type="error">
          Missing or invalid reset link. Please request a new one from the Forgot
          Password page.
        </FormMessage>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <PasswordInput
            id="reset-password"
            label="New password"
            placeholder="Create a strong password"
            autoComplete="new-password"
            hint="Min. 8 characters with upper, lower, number & symbol"
            error={errors.password?.message}
            {...register("password")}
          />
          <PasswordStrengthMeter password={passwordValue} />
        </div>

        <PasswordInput
          id="reset-confirm-password"
          label="Confirm new password"
          placeholder="Re-enter your new password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <FormMessage type={serverMessage.type}>{serverMessage.text}</FormMessage>

        <AuthSubmitButton loading={isSubmitting}>Reset password</AuthSubmitButton>
      </form>

      <p className="auth-switch">
        Remembered your password?{" "}
        <Link to="/login" className="auth-link">
          Back to Login
        </Link>
      </p>
    </AuthCard>
  );
};

export default ResetPassword;
