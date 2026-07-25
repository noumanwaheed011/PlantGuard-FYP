import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, KeyRound, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AnimatedButton from '../components/AnimatedButton';

const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, forgotPassword } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/account', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state?.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(email)) newErrors.email = 'Please enter a valid email';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    setErrors({});
    try {
      await forgotPassword(email.trim().toLowerCase());
      navigate('/reset-password', {
        state: { email: email.trim().toLowerCase() },
      });
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to send reset code. Please try again.' });
      setLoading(false);
    }
  };

  return (
    <div className="page-shell-centered page-bg-light">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
        className="w-full max-w-lg"
      >
        <div className="page-card">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-forest-600 to-earth-600 text-white text-base font-semibold mb-6"
          >
            <KeyRound className="w-5 h-5" />
            Reset Password
          </motion.div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Forgot your password?</h1>
          <p className="text-gray-500 text-sm sm:text-base mb-8 sm:mb-10">
            Enter your registered email and we&apos;ll send you a 6-digit code to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                Registered Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                  }}
                  placeholder="you@example.com"
                  className={`w-full h-12 sm:h-14 pl-12 pr-4 rounded-2xl border-2 bg-gray-50/50 focus:bg-white text-base transition-all duration-200 outline-none ${
                    errors.email ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-400/30'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {errors.submit && (
              <p className="text-sm text-red-500">{errors.submit}</p>
            )}

            <AnimatedButton type="submit" variant="primary" fullWidth loading={loading}>
              Send Reset Code
            </AnimatedButton>
          </form>

          <p className="mt-8 text-center text-base text-gray-600">
            Remember your password?{' '}
            <Link to="/login" className="font-semibold text-forest-600 hover:text-forest-700">
              Back to login
            </Link>
          </p>

          <Link
            to="/login"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-forest-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
