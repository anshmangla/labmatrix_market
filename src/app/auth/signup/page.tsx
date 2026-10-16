"use client";

import React, { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Lock,
  Mail,
  User as UserIcon,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Info,
  KeyRound,
  RotateCcw,
  Loader2,
  Edit2,
} from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();

  // Wizard Step: "DETAILS" -> "OTP"
  const [step, setStep] = useState<"DETAILS" | "OTP">("DETAILS");

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // OTP State (6 single digits)
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Timer & Async states
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "OTP" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, countdown]);

  // Focus the first OTP box upon entering Step 2
  useEffect(() => {
    if (step === "OTP") {
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  // Step 1: Send OTP to email
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send verification code.");
        setLoading(false);
        return;
      }

      // Transition to Step 2
      setStep("OTP");
      setCountdown(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      setLoading(false);
    } catch (err: any) {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  };

  // Step 2: Handle OTP input navigation & typing
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.slice(-1).replace(/\D/g, "");
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-advance to next box if digit entered
    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto-verify if all 6 digits filled
    if (digit && index === 5 && newOtp.every((d) => d.length === 1)) {
      handleFinalRegister(newOtp.join(""));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Support pasting full 6-digit code
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasteData) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasteData.length; i++) {
      newOtp[i] = pasteData[i];
    }
    setOtp(newOtp);

    if (pasteData.length === 6) {
      otpInputsRef.current[5]?.focus();
      handleFinalRegister(pasteData);
    } else {
      otpInputsRef.current[Math.min(pasteData.length, 5)]?.focus();
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (!canResend || resending) return;
    setError("");
    setResending(true);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to resend verification code.");
        setResending(false);
        return;
      }

      setCountdown(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      setResending(false);
      otpInputsRef.current[0]?.focus();
    } catch (err: any) {
      setError("Network error while resending code.");
      setResending(false);
    }
  };

  // Step 2: Finalize registration with OTP
  const handleFinalRegister = async (otpCodeToSubmit?: string) => {
    const code = otpCodeToSubmit || otp.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          otp: code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Verification failed. Please check the code and try again.");
        setLoading(false);
        return;
      }

      setSuccess(true);

      // Auto sign-in after successful verification
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
      });

      if (!res?.error) {
        router.push("/");
        router.refresh();
      } else {
        router.push("/auth/signin");
      }
    } catch (err: any) {
      setError("Registration error. Please check your connection and try again.");
      setLoading(false);
    }
  };

  // Google 1-Click Sign In (Option A: frictionless Google verified)
  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (err: any) {
      setError("Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Labmatrix - Keeping Science Ahead"
              width={220}
              height={46}
              priority
              className="h-12 w-auto object-contain hover:opacity-95 transition-opacity"
            />
          </Link>
        </div>

        <h2 className="mt-4 text-center text-2xl font-black tracking-tight text-slate-800">
          {step === "DETAILS" ? "Create your account" : "Verify your email"}
        </h2>
        <p className="mt-2 text-center text-xs sm:text-sm text-slate-600">
          {step === "DETAILS"
            ? "Join the trusted marketplace for analytical & pharmaceutical equipment"
            : `Enter the 6-digit code dispatched to ${email}`}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-100">
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 border border-red-200 flex items-start space-x-3 text-red-700 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-xl bg-emerald-50 p-4 border border-emerald-200 flex items-start space-x-3 text-emerald-800 text-xs sm:text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
              <span>Email verified! Logging you into LabMatrix...</span>
            </div>
          )}

          {/* ================= STEP 1: REGISTRATION DETAILS ================= */}
          {step === "DETAILS" && (
            <div className="space-y-6">
              {/* Notice */}
              <div className="rounded-xl bg-brand-blue-50/60 border border-brand-blue-100 p-3.5 flex items-start space-x-3 text-xs text-slate-700">
                <Info className="w-4 h-4 flex-shrink-0 text-brand-blue mt-0.5" />
                <span>
                  <strong>Secure Verification:</strong> We will dispatch a 6-digit verification code to your email to confirm your identity.
                </span>
              </div>

              {/* Google 1-Click Sign-in */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="w-full flex justify-center items-center gap-3 py-2.5 px-4 border border-slate-300 rounded-xl shadow-xs bg-white text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-all disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{googleLoading ? "Connecting with Google..." : "Sign up with Google (Instant)"}</span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-slate-400 font-bold tracking-wider">
                    Or register with email OTP
                  </span>
                </div>
              </div>

              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs sm:text-sm font-semibold text-slate-700"
                  >
                    Full Name
                  </label>
                  <div className="mt-1 relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Dr. Rajesh Sharma"
                      className="block w-full pl-11 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs sm:text-sm font-semibold text-slate-700"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="analyst@labmatrix.com"
                      className="block w-full pl-11 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs sm:text-sm font-semibold text-slate-700"
                  >
                    Password (min 6 characters) <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-11 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs sm:text-sm font-semibold text-slate-700"
                  >
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-11 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-xs text-xs sm:text-sm font-bold text-brand-blue-950 bg-brand-gold hover:bg-brand-gold-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold transition-all disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span>Sending Verification Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue & Send Code</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ================= STEP 2: 6-DIGIT OTP VERIFICATION ================= */}
          {step === "OTP" && (
            <div className="space-y-6">
              {/* Recipient Details & Change Email */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 truncate">
                  <Mail className="w-4 h-4 text-brand-blue flex-shrink-0" />
                  <span className="font-semibold text-slate-800 truncate" title={email}>
                    {email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep("DETAILS");
                    setError("");
                  }}
                  className="inline-flex items-center space-x-1 text-brand-blue hover:text-brand-blue-500 font-bold ml-2 flex-shrink-0"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Change</span>
                </button>
              </div>

              {/* 6-Digit OTP Inputs */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 text-center mb-3">
                  Enter 6-Digit Verification Code
                </label>

                <div
                  className="flex justify-center gap-2 sm:gap-2.5"
                  onPaste={handleOtpPaste}
                >
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpInputsRef.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black text-brand-blue bg-white border-2 border-slate-200 rounded-xl focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 focus:outline-none transition-all shadow-xs"
                      aria-label={`Digit ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Verify Button */}
              <button
                type="button"
                onClick={() => handleFinalRegister()}
                disabled={loading || otp.join("").length !== 6}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-xs text-xs sm:text-sm font-bold text-white bg-brand-blue hover:bg-brand-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 mr-2" />
                    <span>Verify & Create Account</span>
                  </>
                )}
              </button>

              {/* Resend Cooldown / Resend Action */}
              <div className="text-center pt-1 border-t border-slate-100">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-blue hover:text-brand-blue-500 transition-colors"
                  >
                    {resending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="w-3.5 h-3.5" />
                    )}
                    <span>{resending ? "Sending fresh code..." : "Resend Verification Code"}</span>
                  </button>
                ) : (
                  <p className="text-xs text-slate-500">
                    Did not receive the code? Resend available in{" "}
                    <span className="font-bold text-slate-800">
                      0:{countdown < 10 ? `0${countdown}` : countdown}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-center space-x-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-brand-gold-600" />
            <span>Buyer & Seller privacy guaranteed. Zero spam.</span>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already registered?{" "}
          <Link
            href="/auth/signin"
            className="font-semibold text-brand-blue hover:text-brand-blue-500 underline underline-offset-4"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
