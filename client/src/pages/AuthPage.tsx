import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { BookOpen, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { setCredentials } from "../redux/authSlice";
import { api } from "../services/api";
import type { RootState } from "../redux/store";

type AuthMode = "login" | "register" | "forgot-password" | "reset-password" | "otp-verify";

interface AuthFormFields {
  name?: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  otp?: string;
}

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentToken = useSelector((state: RootState) => state.auth.token);
  
  // Track email for OTP verification state context
  const [unverifiedEmail, setUnverifiedEmail] = useState<string>("");

  const resetToken = searchParams.get("token");

  // If token already exists in Redux/state, redirect to dashboard
  useEffect(() => {
    if (currentToken) {
      navigate("/dashboard");
    }
  }, [currentToken, navigate]);

  // If reset password token is in URL, switch to reset mode
  useEffect(() => {
    if (resetToken) {
      setMode("reset-password");
    }
  }, [resetToken]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<AuthFormFields>({
    defaultValues: {
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
      otp: ""
    }
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Watch password field to validate confirmPassword matches
  const passwordValue = watch("password");

  // Mutation for login
  const loginMutation = useMutation({
    mutationFn: async (data: AuthFormFields) => {
      const res = await api.post("/auth/login", {
        email: data.email,
        password: data.password
      });
      return res.data;
    },
    onSuccess: (data, variables) => {
      if (data.user && !data.user.emailVerified) {
        // If account not verified, redirect to OTP verify state
        setUnverifiedEmail(variables.email);
        setErrorMessage("Please verify your email address to continue.");
        setMode("otp-verify");
        setValue("otp", "");
      } else {
        dispatch(setCredentials({ token: data.token, user: data.user }));
        navigate("/dashboard");
      }
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message ?? "Invalid email or password.");
    }
  });

  // Mutation for registration
  const registerMutation = useMutation({
    mutationFn: async (data: AuthFormFields) => {
      const res = await api.post("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password
      });
      return res.data;
    },
    onSuccess: (data, variables) => {
      setUnverifiedEmail(variables.email);
      setSuccessMessage("Account created successfully! We've sent a verification code to your email.");
      setMode("otp-verify");
      setValue("otp", "");
      setErrorMessage(null);
    },
    onError: (err: any) => {
      const valErrors = err.response?.data?.errors;
      if (valErrors && Array.isArray(valErrors)) {
        setErrorMessage(valErrors.map((e: any) => e.msg).join(", "));
      } else {
        setErrorMessage(err.response?.data?.message ?? "Registration failed. Try again.");
      }
    }
  });

  // Mutation for OTP verification
  const verifyMutation = useMutation({
    mutationFn: async (data: AuthFormFields) => {
      const res = await api.post("/auth/verify-email", {
        email: unverifiedEmail || data.email,
        token: data.otp
      });
      return res.data;
    },
    onSuccess: (data) => {
      setSuccessMessage("Email verified successfully! Logging you in...");
      setTimeout(() => {
        // Auto-login with credentials returned or ask user to switch to login tab
        dispatch(setCredentials({ token: loginMutation.data?.token || registerMutation.data?.token || "", user: data.user }));
        navigate("/dashboard");
      }, 1500);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message ?? "Invalid or expired verification code.");
    }
  });

  // Mutation for forgot password
  const forgotMutation = useMutation({
    mutationFn: async (data: AuthFormFields) => {
      const res = await api.post("/auth/forgot-password", {
        email: data.email
      });
      return res.data;
    },
    onSuccess: () => {
      setSuccessMessage("If that email exists, we have sent a reset password link.");
      setErrorMessage(null);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message ?? "Failed to send reset email.");
    }
  });

  // Mutation for reset password
  const resetMutation = useMutation({
    mutationFn: async (data: AuthFormFields) => {
      const res = await api.post("/auth/reset-password", {
        token: resetToken,
        password: data.password
      });
      return res.data;
    },
    onSuccess: () => {
      setSuccessMessage("Password reset successfully! You can now log in.");
      setErrorMessage(null);
      setTimeout(() => {
        setMode("login");
        reset();
      }, 2000);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message ?? "Failed to reset password. The link may have expired.");
    }
  });

  const onSubmit = (data: AuthFormFields) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    
    if (mode === "login") {
      loginMutation.mutate(data);
    } else if (mode === "register") {
      registerMutation.mutate(data);
    } else if (mode === "otp-verify") {
      verifyMutation.mutate(data);
    } else if (mode === "forgot-password") {
      forgotMutation.mutate(data);
    } else if (mode === "reset-password") {
      resetMutation.mutate(data);
    }
  };

  const isLoading =
    loginMutation.isPending ||
    registerMutation.isPending ||
    verifyMutation.isPending ||
    forgotMutation.isPending ||
    resetMutation.isPending;

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-12">
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-soft">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand text-white">
            <BookOpen size={22} />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-ink">LearnAI</h1>
            <p className="text-sm text-slate-500">Upload. Learn. Practice. Master.</p>
          </div>
        </div>

        {/* Global Error Alert */}
        {errorMessage && (
          <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4.5 w-4.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Global Success Alert */}
        {successMessage && (
          <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TAB NAVIGATION FOR LOGIN / REGISTER */}
        {(mode === "login" || mode === "register") && (
          <div className="mb-6 flex border-b border-slate-200">
            <button
              onClick={() => {
                setMode("login");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 pb-3 text-center text-sm font-semibold transition-all ${
                mode === "login"
                  ? "border-b-2 border-brand text-brand"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => {
                setMode("register");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 pb-3 text-center text-sm font-semibold transition-all ${
                mode === "register"
                  ? "border-b-2 border-brand text-brand"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* FORM STATE SWITCHER */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Back button for sub-modes */}
          {(mode === "forgot-password" || mode === "otp-verify") && (
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand"
            >
              <ArrowLeft size={14} /> Back to Login
            </button>
          )}

          {/* Form Header Info for non-tab screens */}
          {mode === "forgot-password" && (
            <div className="mb-2">
              <h2 className="text-lg font-bold text-ink">Forgot Password?</h2>
              <p className="text-xs text-slate-500">
                Enter your email address and we'll send you a password reset link.
              </p>
            </div>
          )}

          {mode === "otp-verify" && (
            <div className="mb-2">
              <h2 className="text-lg font-bold text-ink">Verify Your Email</h2>
              <p className="text-xs text-slate-500">
                We've sent a 6-digit verification OTP code to <strong className="text-slate-700">{unverifiedEmail}</strong>.
              </p>
            </div>
          )}

          {mode === "reset-password" && (
            <div className="mb-2">
              <h2 className="text-lg font-bold text-ink">Reset Your Password</h2>
              <p className="text-xs text-slate-500">Enter a secure new password for your account.</p>
            </div>
          )}

          {/* Fields depending on mode */}
          {mode === "register" && (
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Full Name</label>
              <input
                className="focus-ring mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm"
                placeholder="John Doe"
                type="text"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>
          )}

          {(mode !== "otp-verify" && mode !== "reset-password") && (
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Email Address</label>
              <input
                className="focus-ring mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm"
                placeholder="you@example.com"
                type="email"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>
          )}

          {mode === "otp-verify" && (
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Verification OTP Code</label>
              <input
                className="focus-ring mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-center text-lg font-bold tracking-widest"
                placeholder="000000"
                maxLength={6}
                type="text"
                {...register("otp", {
                  required: "Verification OTP is required",
                  pattern: { value: /^[0-9]{6}$/, message: "Must be a 6-digit number" }
                })}
              />
              {errors.otp && <p className="mt-1 text-xs text-red-500">{errors.otp.message}</p>}
            </div>
          )}

          {(mode === "login" || mode === "register" || mode === "reset-password") && (
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Password</label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot-password");
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs font-semibold text-brand hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <input
                className="focus-ring mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm"
                placeholder="••••••••"
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "Password must be at least 8 characters" }
                })}
              />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>
          )}

          {(mode === "register" || mode === "reset-password") && (
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Confirm Password</label>
              <input
                className="focus-ring mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm"
                placeholder="••••••••"
                type="password"
                {...register("confirmPassword", {
                  required: "Confirm Password is required",
                  validate: (val) => val === passwordValue || "Passwords do not match"
                })}
              />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="focus-ring mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-75"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : mode === "login" ? (
              "Log In"
            ) : mode === "register" ? (
              "Create Account"
            ) : mode === "otp-verify" ? (
              "Verify Account"
            ) : mode === "forgot-password" ? (
              "Send Reset Link"
            ) : (
              "Save New Password"
            )}
          </button>
        </form>
      </section>
    </main>
  );
}
