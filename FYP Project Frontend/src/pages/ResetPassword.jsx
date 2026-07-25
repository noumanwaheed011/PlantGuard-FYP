import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AnimatedButton from '../components/AnimatedButton';

const OTP_LENGTH = 6;
const COUNTDOWN_SECONDS = 60;

const validatePassword = (password) => {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Za-z]/.test(password)) return 'Password must contain at least one letter';
  if (!/\d/.test(password)) return 'Password must contain at least one number';
  return null;
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, resetPassword, resendForgotPasswordOTP } = useAuth();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const inputRefs = useRef([]);

  useEffect(() => {
    if (user) {
      navigate('/account', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password', { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (secondsLeft <= 0 || success) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, success]);

  const focusInput = (index) => {
    inputRefs.current[index]?.focus();
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setErrors((prev) => ({ ...prev, otp: null, submit: null }));
    if (value && index < OTP_LENGTH - 1) focusInput(index + 1);
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      focusInput(index - 1);
      const next = [...otp];
      next[index - 1] = '';
      setOtp(next);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...otp];
    pasted.split('').forEach((char, i) => {
      next[i] = char;
    });
    setOtp(next);
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const code = otp.join('');

    if (code.length !== OTP_LENGTH) {
      newErrors.otp = 'Please enter the full 6-digit code';
    }
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      const pwErr = validatePassword(newPassword);
      if (pwErr) newErrors.newPassword = pwErr;
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    setErrors({});
    try {
      await resetPassword({
        email,
        otp: code,
        newPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { replace: true, state: { passwordReset: true } });
      }, 2200);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to reset password. Please try again.' });
      setSubmitting(false);
    }
  };

  const resendCode = async () => {
    if (secondsLeft > 0) return;
    try {
      await resendForgotPasswordOTP(email);
      setSecondsLeft(COUNTDOWN_SECONDS);
      setOtp(Array(OTP_LENGTH).fill(''));
      setErrors({});
      focusInput(0);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to resend code. Please try again.' });
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-forest-50">
        <div className="w-10 h-10 border-2 border-forest-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div
      className="page-shell-centered page-bg-light"
    >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex p-6 rounded-full bg-forest-100 text-forest-600 mb-6"
          >
            <CheckCircle className="w-20 h-20" />
          </motion.div>
          <h1 className="text-3xl font-bold text-forest-900 mb-2">Password Reset Successful</h1>
          <p className="text-gray-600">Redirecting to login...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="page-shell-centered page-bg-light"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="page-card">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex p-3 rounded-2xl bg-forest-100 text-forest-600 mb-6"
          >
            <ShieldCheck className="w-8 h-8" />
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Set a new password</h1>
          <p className="text-gray-500 text-sm sm:text-base mb-2 break-all">
            Enter the 6-digit code sent to <strong>{email}</strong>
          </p>
          <div className="bg-forest-50 border border-forest-200 rounded-xl p-4 mb-6">
            <p className="text-forest-800 text-sm">
              Check your inbox (and spam folder). In development, the code is also printed in the backend console.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Verification code</label>
              <div className="flex justify-center gap-1.5 sm:gap-2 md:gap-3 max-w-full overflow-x-auto px-1">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={handlePaste}
                    className="w-10 h-12 sm:w-12 sm:h-14 md:w-14 md:h-16 shrink-0 text-center text-lg sm:text-xl font-bold rounded-xl border-2 border-gray-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-400/30 outline-none transition-all"
                  />
                ))}
              </div>
              {errors.otp && <p className="mt-2 text-sm text-red-500 text-center">{errors.otp}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">New password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, newPassword: null, submit: null }));
                  }}
                  placeholder="Enter new password"
                  className={`w-full h-12 sm:h-14 pl-12 pr-14 rounded-2xl border-2 bg-gray-50/50 focus:bg-white text-base outline-none ${
                    errors.newPassword ? 'border-red-400' : 'border-gray-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-400/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.newPassword && <p className="mt-2 text-sm text-red-500">{errors.newPassword}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm new password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, confirmPassword: null, submit: null }));
                  }}
                  placeholder="Confirm new password"
                  className={`w-full h-12 sm:h-14 pl-12 pr-14 rounded-2xl border-2 bg-gray-50/50 focus:bg-white text-base outline-none ${
                    errors.confirmPassword ? 'border-red-400' : 'border-gray-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-400/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-2 text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>

            {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}

            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <span>Code expires in</span>
              <span className="font-mono font-semibold text-forest-600 min-w-[2ch]">
                {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>

            <AnimatedButton type="submit" variant="primary" fullWidth loading={submitting}>
              Reset Password
            </AnimatedButton>

            <p className="text-center text-sm text-gray-500">
              Didn&apos;t receive the code?{' '}
              <button
                type="button"
                onClick={resendCode}
                disabled={secondsLeft > 0}
                className={`font-semibold ${secondsLeft > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-forest-600 hover:text-forest-700'}`}
              >
                Resend {secondsLeft > 0 ? `(${secondsLeft}s)` : ''}
              </button>
            </p>
          </form>

          <Link
            to="/forgot-password"
            state={{ email }}
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-forest-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Use a different email
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
