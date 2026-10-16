"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  RotateCcw,
  Loader2,
  Edit2,
  Eye,
  EyeOff,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Wizard Step: "EMAIL" -> "RESET"
  const [step, setStep] = useState<"EMAIL" | "RESET">("EMAIL");

  // Form Fields
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP State (6 single digits)
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Timer & Async states
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "RESET" && countdown > 0) {
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
    if (step === "RESET") {
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  // Step 1: Request Password Reset OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/password/reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send reset code. Please try again.");
        setLoading(false);
        return;
      }

      // Transition to Step 2
      setStep("RESET");
      setCountdown(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      setInfoMessage(data.message || "A 6-digit code has been dispatched to your email.");
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

    const targetFocus = Math.min(pasteData.length, 5);
    otpInputsRef.current[targetFocus]?.focus();
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (!canResend || resending) return;
    setError("");
    setResending(true);

    try {
      const res = await fetch("/api/auth/password/reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to resend code.");
        setResending(false);
        return;
      }

      setCountdown(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      setInfoMessage("A fresh verification code has been dispatched to your inbox.");
      otpInputsRef.current[0]?.focus();
      setResending(false);
    } catch (err: any) {
      setError("Network error. Could not resend code.");
      setResending(false);
    }
  };

  // Step 2: Submit OTP & New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/password/reset-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: code,
          password: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
        setLoading(false);
        return;
      }

      // Success: Redirect back to /auth/signin with success query parameter
      router.push("/auth/signin?reset=success");
    } catch (err: any) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
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
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-800">
          {step === "EMAIL" ? "Forgot your password?" : "Set a new password"}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          {step === "EMAIL"
            ? "Enter your registered email address to receive a verification code"
            : `Enter the 6-digit code sent to ${email} and choose your new password`}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-100">
          {/* Error Banner */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 flex items-start space-x-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Info Banner */}
          {infoMessage && !error && (
            <div className="mb-6 rounded-lg bg-blue-50 p-3.5 border border-blue-200 flex items-start space-x-2.5 text-blue-800 text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-blue-600 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === "EMAIL" && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Registered email address
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@labmatrix.com"
                    className="block w-full pl-11 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue text-sm text-slate-900 placeholder-slate-400 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-xs text-sm font-semibold text-white bg-brand-blue hover:bg-brand-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-all disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Sending Verification Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-brand-blue transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}

          {/* STEP 2: Enter OTP & New Password */}
          {step === "RESET" && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* Target Email Box with Change option */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <Mail className="w-4 h-4 text-brand-blue shrink-0" />
                  <span className="text-xs font-semibold text-slate-800 truncate">
                    {email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep("EMAIL");
                    setError("");
                    setInfoMessage("");
                  }}
                  className="inline-flex items-center text-xs font-semibold text-brand-blue hover:text-brand-blue-600 transition-colors ml-2 shrink-0"
                >
                  <Edit2 className="w-3 h-3 mr-1" />
                  <span>Change</span>
                </button>
              </div>

              {/* 6-Digit OTP Box */}
              <div>
                <label className="block text-center text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Enter 6-digit code
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

              {/* New Password */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-semibold text-slate-700"
                >
                  New password
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="block w-full pl-11 pr-10 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue text-sm text-slate-900 placeholder-slate-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Confirm new password
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="block w-full pl-11 pr-10 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue text-sm text-slate-900 placeholder-slate-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || otp.join("").length !== 6 || newPassword.length < 6}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-xs text-xs sm:text-sm font-bold text-white bg-brand-blue hover:bg-brand-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 mr-2" />
                    <span>Reset Password</span>
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
            </form>
          )}

          <div className="mt-6 flex items-center justify-center space-x-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-brand-gold-600" />
            <span>Encrypted & secure. Privacy protected.</span>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Remember your password?{" "}
          <Link
            href="/auth/signin"
            className="font-semibold text-brand-blue hover:text-brand-blue-500 underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
