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

/* ── shared input style ── */
const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "none",
  borderBottom: "1.5px solid rgba(107,31,42,0.35)",
  background: "transparent",
  fontFamily: "var(--font-body)",
  fontSize: "15px",
  color: "#241a10",
  padding: "6px 2px 10px",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-mono)",
  fontSize: "10px",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "#6b5a3a",
  marginBottom: "6px",
};

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentToken = useSelector((state: RootState) => state.auth.token);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string>("");
  const resetToken = searchParams.get("token");

  useEffect(() => { if (currentToken) navigate("/dashboard"); }, [currentToken, navigate]);
  useEffect(() => { if (resetToken) setMode("reset-password"); }, [resetToken]);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } =
    useForm<AuthFormFields>({ defaultValues: { email: "", name: "", password: "", confirmPassword: "", otp: "" } });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const passwordValue = watch("password");

  const loginMutation = useMutation({
    mutationFn: async (data: AuthFormFields) => (await api.post("/auth/login", { email: data.email, password: data.password })).data,
    onSuccess: (data) => {
      dispatch(setCredentials({ token: data.token, user: data.user }));
      navigate("/dashboard");
    },
    onError: (err: any) => setErrorMessage(err.response?.data?.message ?? "Invalid email or password."),
  });

  const registerMutation = useMutation({
    mutationFn: async (data: AuthFormFields) => (await api.post("/auth/register", { name: data.name, email: data.email, password: data.password })).data,
    onSuccess: (data) => {
      dispatch(setCredentials({ token: data.token, user: data.user }));
      navigate("/dashboard");
    },
    onError: (err: any) => {
      const valErrors = err.response?.data?.errors;
      setErrorMessage(valErrors && Array.isArray(valErrors)
        ? valErrors.map((e: any) => e.msg).join(", ")
        : err.response?.data?.message ?? "Registration failed. Try again.");
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (data: AuthFormFields) =>
      (await api.post("/auth/verify-email", { email: unverifiedEmail || data.email, token: data.otp })).data,
    onSuccess: (data) => {
      setSuccessMessage("Email verified! Logging you in…");
      setTimeout(() => {
        dispatch(setCredentials({ token: loginMutation.data?.token || registerMutation.data?.token || "", user: data.user }));
        navigate("/dashboard");
      }, 1500);
    },
    onError: (err: any) => setErrorMessage(err.response?.data?.message ?? "Invalid or expired verification code."),
  });

  const forgotMutation = useMutation({
    mutationFn: async (data: AuthFormFields) => (await api.post("/auth/forgot-password", { email: data.email })).data,
    onSuccess: () => { setSuccessMessage("If that email exists, we've sent a reset link."); setErrorMessage(null); },
    onError: (err: any) => setErrorMessage(err.response?.data?.message ?? "Failed to send reset email."),
  });

  const resetMutation = useMutation({
    mutationFn: async (data: AuthFormFields) => (await api.post("/auth/reset-password", { token: resetToken, password: data.password })).data,
    onSuccess: () => {
      setSuccessMessage("Password reset! You can now log in.");
      setTimeout(() => { setMode("login"); reset(); }, 2000);
    },
    onError: (err: any) => setErrorMessage(err.response?.data?.message ?? "Failed to reset password. Link may have expired."),
  });

  const onSubmit = (data: AuthFormFields) => {
    setErrorMessage(null); setSuccessMessage(null);
    if (mode === "login")            loginMutation.mutate(data);
    else if (mode === "register")    registerMutation.mutate(data);
    else if (mode === "otp-verify")  verifyMutation.mutate(data);
    else if (mode === "forgot-password") forgotMutation.mutate(data);
    else if (mode === "reset-password")  resetMutation.mutate(data);
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending ||
    verifyMutation.isPending || forgotMutation.isPending || resetMutation.isPending;

  const btnLabel = isLoading ? "Processing…"
    : mode === "login" ? "Sign In"
    : mode === "register" ? "Create Account"
    : mode === "otp-verify" ? "Verify Account"
    : mode === "forgot-password" ? "Send Reset Link"
    : "Save New Password";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
      }}
    >
      {/* Wordmark above card */}
      <p style={{
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        letterSpacing: "0.35em",
        textTransform: "uppercase",
        color: "rgba(231,199,102,0.6)",
        marginBottom: "24px",
      }}>
        LearnAI
      </p>

      {/* Parchment card */}
      <section
        style={{
          position: "relative",
          width: "min(90vw, 380px)",
          background: "linear-gradient(160deg, #f2e8d5 0%, #e6d9bd 100%)",
          borderRadius: "6px",
          color: "#241a10",
          boxShadow: "0 50px 90px -25px rgba(0,0,0,.65), 0 0 0 1px rgba(201,162,39,.35)",
          padding: "40px 36px 32px",
        }}
      >
        {/* inner ornament border */}
        <span style={{
          position: "absolute", inset: "10px",
          border: "1px solid rgba(201,162,39,0.3)",
          borderRadius: "3px", pointerEvents: "none",
        }} />

        {/* Logo + Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <span style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "42px", height: "42px", borderRadius: "8px",
            background: "linear-gradient(135deg, #6b1f2a, #4a151d)",
            boxShadow: "0 0 0 1px rgba(201,162,39,0.4)",
          }}>
            <BookOpen size={20} color="#e7c766" />
          </span>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "22px", margin: 0, color: "#241a10", letterSpacing: "0.04em" }}>
              LearnAI
            </h1>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#6b5a3a", margin: 0 }}>
              Upload · Learn · Master
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: "8px",
            background: "rgba(107,31,42,0.12)", border: "1px solid rgba(107,31,42,0.35)",
            borderRadius: "4px", padding: "10px 12px", marginBottom: "16px",
            fontFamily: "var(--font-body)", fontSize: "13px", color: "#6b1f2a",
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: "1px" }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: "8px",
            background: "rgba(31,69,54,0.12)", border: "1px solid rgba(31,69,54,0.4)",
            borderRadius: "4px", padding: "10px 12px", marginBottom: "16px",
            fontFamily: "var(--font-body)", fontSize: "13px", color: "#163327",
          }}>
            <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: "1px" }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tab navigation for login/register */}
        {(mode === "login" || mode === "register") && (
          <div style={{ display: "flex", borderBottom: "1px solid rgba(107,31,42,0.2)", marginBottom: "24px" }}>
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setErrorMessage(null); setSuccessMessage(null); }}
                style={{
                  flex: 1, paddingBottom: "10px", background: "none", border: "none",
                  fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.18em",
                  textTransform: "uppercase", cursor: "pointer",
                  color: mode === m ? "#6b1f2a" : "rgba(107,42,20,0.45)",
                  borderBottom: mode === m ? "2px solid #6b1f2a" : "2px solid transparent",
                  marginBottom: "-1px", transition: "all 200ms",
                }}
              >
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

          {/* Back link for sub-modes */}
          {(mode === "forgot-password" || mode === "otp-verify") && (
            <button type="button"
              onClick={() => { setMode("login"); setErrorMessage(null); setSuccessMessage(null); }}
              style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "none", border: "none",
                cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.15em",
                textTransform: "uppercase", color: "rgba(107,31,42,0.6)", padding: 0 }}
            >
              <ArrowLeft size={12} /> Back to login
            </button>
          )}

          {mode === "forgot-password" && (
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "#241a10", margin: "0 0 4px" }}>Forgot Password?</h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#6b5a3a", margin: 0 }}>
                Enter your email and we'll send you a reset link.
              </p>
            </div>
          )}

          {mode === "reset-password" && (
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "#241a10", margin: "0 0 4px" }}>Reset Password</h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#6b5a3a", margin: 0 }}>
                Enter a secure new password for your account.
              </p>
            </div>
          )}

          {/* Name field (register) */}
          {mode === "register" && (
            <div>
              <label style={labelStyle}>Full Name</label>
              <input style={inputStyle} placeholder="Jane Smith" type="text"
                onFocus={e => (e.target.style.borderBottomColor = "#6b1f2a")}
                onBlur={e => (e.target.style.borderBottomColor = "rgba(107,31,42,0.35)")}
                {...register("name", { required: "Name is required" })} />
              {errors.name && <p style={{ color: "#6b1f2a", fontSize: "11px", marginTop: "4px" }}>{errors.name.message}</p>}
            </div>
          )}

          {/* Email field */}
          {(mode !== "otp-verify" && mode !== "reset-password") && (
            <div>
              <label style={labelStyle}>Email Address</label>
              <input style={inputStyle} placeholder="you@example.com" type="email"
                onFocus={e => (e.target.style.borderBottomColor = "#6b1f2a")}
                onBlur={e => (e.target.style.borderBottomColor = "rgba(107,31,42,0.35)")}
                {...register("email", { required: "Email is required" })} />
              {errors.email && <p style={{ color: "#6b1f2a", fontSize: "11px", marginTop: "4px" }}>{errors.email.message}</p>}
            </div>
          )}

          {/* OTP field */}
          {mode === "otp-verify" && (
            <div>
              <label style={labelStyle}>Verification OTP Code</label>
              <input style={{ ...inputStyle, textAlign: "center", fontSize: "20px", letterSpacing: "0.4em", fontWeight: 600 }}
                placeholder="000000" maxLength={6} type="text"
                onFocus={e => (e.target.style.borderBottomColor = "#6b1f2a")}
                onBlur={e => (e.target.style.borderBottomColor = "rgba(107,31,42,0.35)")}
                {...register("otp", { required: "OTP is required", pattern: { value: /^[0-9]{6}$/, message: "Must be 6 digits" } })} />
              {errors.otp && <p style={{ color: "#6b1f2a", fontSize: "11px", marginTop: "4px" }}>{errors.otp.message}</p>}
            </div>
          )}

          {/* Password field */}
          {(mode === "login" || mode === "register" || mode === "reset-password") && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={labelStyle}>Password</label>
                {mode === "login" && (
                  <button type="button"
                    onClick={() => { setMode("forgot-password"); setErrorMessage(null); setSuccessMessage(null); }}
                    style={{ background: "none", border: "none", cursor: "pointer",
                      fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.15em",
                      textTransform: "uppercase", color: "rgba(107,31,42,0.6)" }}
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <input style={inputStyle} placeholder="••••••••" type="password"
                onFocus={e => (e.target.style.borderBottomColor = "#6b1f2a")}
                onBlur={e => (e.target.style.borderBottomColor = "rgba(107,31,42,0.35)")}
                {...register("password", { required: "Password is required", minLength: { value: 8, message: "At least 8 characters" } })} />
              {errors.password && <p style={{ color: "#6b1f2a", fontSize: "11px", marginTop: "4px" }}>{errors.password.message}</p>}
            </div>
          )}

          {/* Confirm Password */}
          {(mode === "register" || mode === "reset-password") && (
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input style={inputStyle} placeholder="••••••••" type="password"
                onFocus={e => (e.target.style.borderBottomColor = "#6b1f2a")}
                onBlur={e => (e.target.style.borderBottomColor = "rgba(107,31,42,0.35)")}
                {...register("confirmPassword", { required: "Required", validate: (v) => v === passwordValue || "Passwords don't match" })} />
              {errors.confirmPassword && <p style={{ color: "#6b1f2a", fontSize: "11px", marginTop: "4px" }}>{errors.confirmPassword.message}</p>}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%", padding: "13px",
              background: "linear-gradient(160deg, #6b1f2a, #4a151d)",
              border: "none", borderRadius: "3px",
              fontFamily: "var(--font-mono)", fontSize: "11px",
              letterSpacing: "0.22em", textTransform: "uppercase",
              color: "#f2e8d5", cursor: isLoading ? "not-allowed" : "pointer",
              boxShadow: "0 10px 22px -8px rgba(107,31,42,0.6)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              opacity: isLoading ? 0.75 : 1, transition: "filter 150ms",
            }}
            onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.1)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1)"; }}
          >
            {isLoading ? <><Loader2 size={14} className="animate-spin" /> Processing…</> : btnLabel}
          </button>
        </form>

        {/* Mode switcher note */}
        {(mode === "login" || mode === "register") && (
          <p style={{ textAlign: "center", marginTop: "20px", fontFamily: "var(--font-body)", fontSize: "13px", color: "#6b5a3a" }}>
            {mode === "login"
              ? <>New here?{" "}<button type="button" onClick={() => { setMode("register"); setErrorMessage(null); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#6b1f2a", fontWeight: 600, fontFamily: "inherit" }}>
                  Create an account
                </button></>
              : <>Already have an account?{" "}<button type="button" onClick={() => { setMode("login"); setErrorMessage(null); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#6b1f2a", fontWeight: 600, fontFamily: "inherit" }}>
                  Log in
                </button></>
            }
          </p>
        )}
      </section>
    </main>
  );
}
