import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AnimatedButton from '../components/AnimatedButton';

const OTP_LENGTH = 6;
const COUNTDOWN_SECONDS = 60;

export default function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, resendOTP: resendOTPAPI } = useAuth();
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);
  
  const email = location.state?.email || '';

  // Redirect to signup if no email in state (e.g. direct URL access)
  useEffect(() => {
    if (!email) {
      navigate('/signup', { replace: true });
    }
  }, [email, navigate]);

  // Countdown timer
  useEffect(() => {
    if (secondsLeft <= 0 || verified) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, verified]);

  const focusInput = (index) => {
    inputRefs.current[index]?.focus();
  };

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setError('');
    if (value && index < OTP_LENGTH - 1) focusInput(index + 1);
  };

  const handleKeyDown = (index, e) => {
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
    pasted.split('').forEach((char, i) => (next[i] = char));
    setOtp(next);
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) {
      setError('Please enter the full 6-digit code');
      return;
    }
    setVerifying(true);
    setError('');
    
    try {
      await verifyOTP(email, code);
      setVerified(true);
      setTimeout(() => {
        navigate('/account', { replace: true });
      }, 2200);
    } catch (error) {
      setError(error.message || 'Invalid OTP. Please try again.');
      setVerifying(false);
    }
  };

  const resendOtp = async () => {
    if (secondsLeft > 0) return;
    
    try {
      await resendOTPAPI(email);
      setSecondsLeft(COUNTDOWN_SECONDS);
      setOtp(Array(OTP_LENGTH).fill(''));
      setError('');
      focusInput(0);
    } catch (error) {
      setError(error.message || 'Failed to resend OTP. Please try again.');
    }
  };

  if (verified) {
    return (
      <div className="page-shell-centered page-bg">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
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
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-forest-900 mb-2"
          >
            Verified Successfully
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600"
          >
            Redirecting to your account...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-forest-50">
        <div className="w-10 h-10 border-2 border-forest-500 border-t-transparent rounded-full animate-spin" />
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
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="page-card">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex p-3 rounded-2xl bg-forest-100 text-forest-600 mb-6"
          >
            <ShieldCheck className="w-8 h-8" />
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Verify your email</h1>
          <p className="text-gray-500 text-sm sm:text-base mb-2 break-all">
            We sent a 6-digit code to <strong>{location.state?.email || 'your email'}</strong>
          </p>
          <div className="bg-forest-50 border border-forest-200 rounded-xl p-4 mb-6">
            <p className="text-forest-900 text-sm font-semibold mb-2">
              Where to find your code
            </p>
            <p className="text-forest-800 text-sm mb-2">
              Check your email inbox (including spam) for a message from PlantGuard AI.
            </p>
            <p className="text-forest-700 text-xs">
              In development, the code may also be printed in the backend server console.
            </p>
          </div>
          <p className="text-gray-500 text-sm mb-8">Enter the 6-digit code below:</p>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-center gap-1.5 sm:gap-2 md:gap-3 max-w-full overflow-x-auto px-1">
              {otp.map((digit, i) => (
                <motion.input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="w-10 h-12 sm:w-12 sm:h-14 md:w-14 md:h-16 shrink-0 text-center text-lg sm:text-xl font-bold rounded-xl border-2 border-gray-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-400/30 outline-none transition-all"
                />
              ))}
            </div>
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-red-500 text-sm">
                {error}
              </motion.p>
            )}

            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <span>Code expires in</span>
              <motion.span
                key={secondsLeft}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="font-mono font-semibold text-forest-600 min-w-[2ch]"
              >
                {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}
              </motion.span>
            </div>

            <AnimatedButton
              type="submit"
              variant="primary"
              fullWidth
              loading={verifying}
            >
              Verify OTP
            </AnimatedButton>

            <p className="text-center text-sm text-gray-500">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={resendOtp}
                disabled={secondsLeft > 0}
                className={`font-semibold ${secondsLeft > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-forest-600 hover:text-forest-700'}`}
              >
                Resend {secondsLeft > 0 ? `(${secondsLeft}s)` : ''}
              </button>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
