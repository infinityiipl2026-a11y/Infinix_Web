import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiUser, FiMail, FiPhone } from "react-icons/fi";

import { registerUser } from "../services/api";
import { registerSchema } from "../validation/authSchemas";

import AuthCard from "../components/auth/AuthCard";
import AuthInput from "../components/auth/AuthInput";
import PasswordInput from "../components/auth/PasswordInput";
import PasswordStrengthMeter from "../components/auth/PasswordStrengthMeter";
import AuthSubmitButton from "../components/auth/AuthSubmitButton";
import FormMessage from "../components/auth/FormMessage";

const Register = () => {
  const navigate = useNavigate();
  const [serverMessage, setServerMessage] = useState({ type: "", text: "" });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      fullname: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: ""
    }
  });

  const passwordValue = watch("password");

  const onSubmit = async ({ fullname, email, phone, password }) => {
    setServerMessage({ type: "", text: "" });

    try {
      const data = await registerUser({ fullname, email, phone, password });

      if (data.success) {
        reset();
        setServerMessage({
          type: "success",
          text: "Registration successful! Redirecting to login..."
        });
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setServerMessage({
          type: "error",
          text: data.message || "Registration failed. Please try again."
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
      eyebrow="Create account"
      title="Register"
      subtitle="Join us and start shopping in minutes"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthInput
          id="register-fullname"
          label="Full name"
          icon={FiUser}
          placeholder="Jane Doe"
          autoComplete="name"
          error={errors.fullname?.message}
          {...register("fullname")}
        />

        <AuthInput
          id="register-email"
          label="Email address"
          type="email"
          icon={FiMail}
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <AuthInput
          id="register-phone"
          label="Phone number"
          type="tel"
          icon={FiPhone}
          placeholder="10-digit mobile number"
          autoComplete="tel"
          inputMode="numeric"
          error={errors.phone?.message}
          {...register("phone")}
        />

        <div>
          <PasswordInput
            id="register-password"
            label="Password"
            placeholder="Create a strong password"
            autoComplete="new-password"
            hint="Min. 8 characters with upper, lower, number & symbol"
            error={errors.password?.message}
            {...register("password")}
          />
          <PasswordStrengthMeter password={passwordValue} />
        </div>

        <PasswordInput
          id="register-confirm-password"
          label="Confirm password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
{/* 
        <label className="auth-checkbox auth-terms">
          <input type="checkbox" {...register("terms")} />
          <span>
            I agree to the <Link to="/about" className="auth-link">Terms &amp; Conditions</Link>
          </span>
        </label>
        {errors.terms && (
          <p className="auth-field-error" role="alert">
            {errors.terms.message}
          </p>
        )} */}

        <FormMessage type={serverMessage.type}>{serverMessage.text}</FormMessage>

        <AuthSubmitButton loading={isSubmitting}>Register</AuthSubmitButton>
      </form>

      <p className="auth-switch">
        Already have an account?{" "}
        <Link to="/login" className="auth-link">
          Login
        </Link>
      </p>
    </AuthCard>
  );
};

export default Register;
