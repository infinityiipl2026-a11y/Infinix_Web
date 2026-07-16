import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiMail } from "react-icons/fi";

import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/api";
import { loginSchema } from "../validation/authSchemas";

import AuthCard from "../components/auth/AuthCard";
import AuthInput from "../components/auth/AuthInput";
import PasswordInput from "../components/auth/PasswordInput";
import AuthSubmitButton from "../components/auth/AuthSubmitButton";
import FormMessage from "../components/auth/FormMessage";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [serverMessage, setServerMessage] = useState({ type: "", text: "" });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: { email: "", password: "", remember: false }
  });

  const onSubmit = async ({ email, password }) => {
    setServerMessage({ type: "", text: "" });

    try {
      const data = await loginUser({ email, password });

      if (data.success) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        setServerMessage({ type: "success", text: "Login successful! Redirecting..." });
        setTimeout(() => navigate("/"), 700);
      } else {
        setServerMessage({
          type: "error",
          text: data.message || "Invalid email or password."
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
      eyebrow="Welcome back"
      title="Login"
      subtitle="Sign in to continue to your account"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthInput
          id="login-email"
          label="Email address"
          type="email"
          icon={FiMail}
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <PasswordInput
          id="login-password"
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="auth-row-between">
          <label className="auth-checkbox">
            <input type="checkbox" {...register("remember")} />
            <span>Remember me</span>
          </label>

          <Link to="/forgot-password" className="auth-link">
            Forgot password?
          </Link>
        </div>

        <FormMessage type={serverMessage.type}>{serverMessage.text}</FormMessage>

        <AuthSubmitButton loading={isSubmitting}>Login</AuthSubmitButton>
      </form>

      <p className="auth-switch">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="auth-link">
          Register
        </Link>
      </p>
    </AuthCard>
  );
};

export default Login;
